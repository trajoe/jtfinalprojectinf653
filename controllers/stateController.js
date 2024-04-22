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

        res.json({ funFact: randomFunFact });
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
    const stateCode = req.params.state.toLowerCase();
    const { funfacts } = req.body;

    try {
        
        let state = await State.findOne({ stateCode });

        // If state not found, create a new document
        if (!state) {
            state = new State({ stateCode });
        }

        
        const existingFunFacts = state.funfacts || [];

        
        if (funfacts && funfacts.length > 0) {
            state.funfacts = [...new Set([...existingFunFacts, ...funfacts])];
        }

        
        await state.save();

        
        res.json({ funfacts: state.funfacts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.updateFunFact = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const { index, funfact } = req.body;

    try {
        // Validate request body
        if (!index || !funfact) {
            return res.status(400).json({ error: 'Missing index or funfact in request body' });
        }

        // Query MongoDB to get state data including fun facts
        const stateFromDB = await State.findOne({ stateCode });

        if (!stateFromDB) {
            return res.status(404).json({ error: 'State not found' });
        }

        // Adjust index to zero-based
        const adjustedIndex = parseInt(index) - 1;

        // Check if the provided index is valid
        if (adjustedIndex < 0 || adjustedIndex >= stateFromDB.funfacts.length) {
            return res.status(400).json({ error: 'Invalid index provided' });
        }

        // Update the fun fact at the specified index
        stateFromDB.funfacts[adjustedIndex] = funfact;

        // Save the updated state data to MongoDB
        await stateFromDB.save();

        // Return the updated state data with fun facts
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