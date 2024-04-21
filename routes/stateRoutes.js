const express = require('express');
const router = express.Router();
const { getState, getAllStates, addFunFacts, getRandomFunFact} = require('../controllers/stateController');
const verifyStates = require('../middleware/verifyStates');
const statesData = require('../models/statesData.json');

router.get('/:state', verifyStates, getState);
router.get('/', getAllStates);
router.get('/:state/funfact', verifyStates, getRandomFunFact);
router.post('/:state/funfact', verifyStates, addFunFacts);


    //capital
router.get('/:state/capital', verifyStates, (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    
    
    const stateData = statesData.find(state => state.code === stateCode);
    
    if (!stateData) {
        return res.status(404).json({ error: 'State not found' });
    }
    
    
    const capitalName = stateData.capital_city;
    
    
    res.json({ state: stateData.state, capital: capitalName });
});

    //nickname
router.get('/:state/nickname', verifyStates, (req, res) => {
    const stateCode = req.params.state.toUpperCase();

    
    const stateData = statesData.find(state => state.code === stateCode);

    if (!stateData) {
        return res.status(404).json({ error: 'State not found' });
    }

    
    const nickname = stateData.nickname;

    
    res.json({ state: stateData.state, nickname: nickname });
});

    //population
router.get('/:state/population', verifyStates, (req, res) => {
    const stateCode = req.params.state.toUpperCase();

    
    const stateData = statesData.find(state => state.code === stateCode);

    if (!stateData) {
        return res.status(404).json({ error: 'State not found' });
    }

    
    const population = stateData.population;

    
    res.json({ state: stateData.state, population: population });
});

    //admission
router.get('/:state/admission', verifyStates, (req, res) => {
    const stateCode = req.params.state.toUpperCase();

   
    const stateData = statesData.find(state => state.code === stateCode);

    if (!stateData) {
        return res.status(404).json({ error: 'State not found' });
    }

    
    const admissionDate = stateData.admission_date;

    
    res.json({ state: stateData.state, admitted: admissionDate });
});












module.exports = router;

