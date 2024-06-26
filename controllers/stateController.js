const statesData = require('../models/statesData.json');
const State = require('../models/States');
const fs = require('fs');
const path = require('path');
const verifyStates = require('../middleware/verifyStates');

exports.getCapital = (req,res) => {
const stateCode = req.params.state.toUpperCase();
const stateData = statesData.find(state => state.code === stateCode);
const capitalName = stateData.capital_city;

res.json({state: stateData.state, capital: capitalName});
};

exports.getNickname = (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const stateData = statesData.find(state => state.code === stateCode);
    const nickname = stateData.nickname;
    res.json ({state: stateData.state, nickname: nickname});
};

exports.getPopulation = (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const stateData = statesData.find(state => state.code === stateCode);
    const population = stateData.population; 
    const populationWithCommas = population.toLocaleString();
    res.json ({state: stateData.state, population: populationWithCommas});
};

exports.getAdmission = (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const stateData = statesData.find(state => state.code ===stateCode);
    const admissionDate = stateData.admission_date;
    res.json({state: stateData.state, admitted: admissionDate});
};


exports.getState = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();

    try {
        
        const stateFromDB = await State.findOne({ stateCode });

        
        const stateDataFromFile = statesData.find(state => state.code === stateCode);

        if (!stateDataFromFile) {
            return res.status(404).json({ error: 'State not found' });
        }

        //merge
        let mergedStateData = { ...stateDataFromFile };

        
        if (stateFromDB && stateFromDB.funfacts) {
            mergedStateData.funfacts = stateFromDB.funfacts;
        }

        
        res.json(mergedStateData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getRandomFunFact = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();

    try {
        
        const stateFromDB = await State.findOne({ stateCode });
        if (!stateFromDB || !stateFromDB.funfacts || stateFromDB.funfacts.length === 0) {
            
            const stateDataFromFile = statesData.find(state => state.code === stateCode);
            const stateName = stateDataFromFile ? stateDataFromFile.state : stateCode;
            return res.status(404).json({ message: `No Fun Facts found for ${stateName}` });
        }

        
        const randomIndex = Math.floor(Math.random() * stateFromDB.funfacts.length);
        const randomFunFact = stateFromDB.funfacts[randomIndex];

        res.json({ funfact: randomFunFact });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getAllStates = async (req, res) => {
    const contig = req.query.contig;

    try {
        let statesToSend = statesData; 

        if (contig === 'true') {
            
            statesToSend = statesData.filter(state => state.code !== 'AK' && state.code !== 'HI');
        } else if (contig === 'false') {
            
            statesToSend = statesData.filter(state => state.code === 'AK' || state.code === 'HI');
        }

        
        const statesWithFunFacts = await Promise.all(statesToSend.map(async state => {
            const stateFromDB = await State.findOne({ stateCode: state.code });
           
            if (stateFromDB && stateFromDB.funfacts) {
                state.funfacts = stateFromDB.funfacts;
            }
            
            return state;
        }));

        res.json(statesWithFunFacts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




exports.addFunFacts = async (req, res) => {
    const stateCode = req.params.state.toUpperCase(); 
    const { funfacts } = req.body;

    try {
        
        //check if fun facts Array is false / empty
        if (!funfacts || funfacts.length === 0) {
            return res.status(400).json({ message: 'State fun facts value required' });
        }
       
        if (!funfacts || !Array.isArray(funfacts)) {
            return res.status(400).json({ message: 'State fun facts value must be an array' });
        }

        let state = await State.findOne({ stateCode });

        
        if (!state) {
            state = new State({ stateCode });
        }

       
        state.funfacts = [...new Set([...(state.funfacts || []), ...funfacts])];
        await state.save();

        
        res.json(state);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



exports.updateFunFact = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const { index, funfact } = req.body;

    try {
        
         if (!index) {
            return res.status(400).json({ message: 'State fun fact index value required' });
            }

            if (!funfact || typeof funfact !== 'string') {
                return res.status(400).json({ message: 'State fun fact value required' });
            }
    
        
        const adjustedIndex = parseInt(index) - 1;


        const state = await State.findOne({ stateCode });

        
        if (!state || !state.funfacts || state.funfacts.length === 0) {
            const stateDataFromFile = statesData.find(state => state.code === stateCode);
            const stateName = stateDataFromFile ? stateDataFromFile.state : stateCode;
            return res.status(404).json({ message: `No Fun Facts found for ${stateName}` });
        }

        if (adjustedIndex < 0 || adjustedIndex >= state.funfacts.length) {
            const stateDataFromFile = statesData.find(state => state.code === stateCode);
            const stateName = stateDataFromFile ? stateDataFromFile.state : stateCode;
            return res.status(404).json({ message: `No Fun Fact found at that index for ${stateName}` });
        }


        state.funfacts[adjustedIndex] = funfact;

        await state.save();

       res.json(state);
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.deleteFunFact = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const { index } = req.body;

    try {
        if (!index){
            return res.status(400).json ({message: 'State fun fact index value required' });
        }
    
        const adjustedIndex = parseInt(index) - 1;

        const state = await State.findOne({ stateCode });

        if (!state || !state.funfacts || state.funfacts.length === 0) {
            const stateDataFromFile = statesData.find(state => state.code === stateCode);
            const stateName = stateDataFromFile ? stateDataFromFile.state : stateCode;
            return res.status(404).json({ message: `No Fun Facts found for ${stateName}` });
        }

        if (adjustedIndex < 0 || adjustedIndex >= state.funfacts.length) {
            const stateDataFromFile = statesData.find(state => state.code === stateCode);
            const stateName = stateDataFromFile ? stateDataFromFile.state : stateCode;
            return res.status(404).json({ message: `No Fun Fact found at that index for ${stateName}` });
        }

        //filter elemeent 
        state.funfacts = state.funfacts.filter((fact, i) => i !== adjustedIndex);

        await state.save();

        res.json(state);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }

};






