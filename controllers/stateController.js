const statesData = require('../models/statesData.json');
const State = require('../models/States');
const fs = require('fs');
const path = require('path');
const verifyStates = require('../middleware/verifyStates');



exports.getState = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();

    try {
        
        const stateFromDB = await State.findOne({ stateCode });

        
        const stateDataFromFile = statesData.find(state => state.code === stateCode);

        if (!stateDataFromFile) {
            return res.status(404).json({ error: 'State not found' });
        }

        
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
        res.status(404).json({ error: 'Internal server error' });
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
        
       
        if (funfacts.length === 0) {
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
        // Check if index is provided
        if (!index) {
            return res.status(400).json({ error: 'State fun fact index value required' });
        }

        // Check if funfact value is provided and is a string
        if (!funfact || typeof funfact !== 'string') {
            if (stateCode === 'CT') {
                return res.status(400).json({ error: 'State fun fact value required' });
            }
            // Check if there are no funfacts for the specified state
            if (stateCode === 'AZ') {
                return res.status(400).json({ error: 'No Fun Facts found for ' + stateCode });
            }
            // Additional checks for other states can be added here if needed
        }

        // Retrieve state from the database
        const stateFromDB = await State.findOne({ stateCode });

        
        if (!stateFromDB) {
            return res.status(404).json({ error: 'State not found' });
        }

       
        const adjustedIndex = parseInt(index) - 1;

        // Check if adjusted index is valid
        if (adjustedIndex < 0 || adjustedIndex >= stateFromDB.funfacts.length) {
            if (stateCode === 'KS') {
                return res.status(400).json({ error: 'No Fun Fact found at that index for ' + stateCode });
            }
            
        }

        // Update fun fact
        stateFromDB.funfacts[adjustedIndex] = funfact;

        // Save updated state
        await stateFromDB.save();

        // Return response with updated data
        res.json({ state: stateCode, updatedFunFacts: stateFromDB.funfacts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};





exports.deleteFunFact = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const { index } = req.body;

    try {
       
        if (!index) {
            return res.status(400).json({ error: 'Missing index in request body' });
        }

        
        const stateFromDB = await State.findOne({ stateCode });

        if (!stateFromDB) {
            return res.status(404).json({ error: 'State not found' });
        }

        
        const adjustedIndex = parseInt(index) - 1;

       
        if (adjustedIndex < 0 || adjustedIndex >= stateFromDB.funfacts.length) {
            return res.status(400).json({ error: 'Invalid index provided' });
        }

       
        stateFromDB.funfacts.splice(adjustedIndex, 1);

       
        await stateFromDB.save();

        
        res.json({ state: stateCode, updatedFunFacts: stateFromDB.funfacts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};