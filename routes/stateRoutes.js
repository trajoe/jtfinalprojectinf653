const express = require('express');
const router = express.Router();
const { getState, getAllStates, addFunFacts, getRandomFunFact, updateFunFact, deleteFunFact} = require('../controllers/stateController');
const verifyStates = require('../middleware/verifyStates');
const statesData = require('../models/statesData.json');

router.get('/:state', verifyStates, getState);
router.get('/', getAllStates);
router.get('/:state/funfact', verifyStates, getRandomFunFact);
router.post('/:state/funfact', verifyStates, addFunFacts);
router.put('/:state/funfact', verifyStates, updateFunFact);
router.delete('/:state/funfact', verifyStates, deleteFunFact);

    //capital
router.get('/:state/capital', verifyStates, (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    
    
    const stateData = statesData.find(state => state.code === stateCode);
    
   
    
    
    const capitalName = stateData.capital_city;
    
    
    res.json({ state: stateData.state, capital: capitalName });
});

    //nickname
router.get('/:state/nickname', verifyStates, (req, res) => {
    const stateCode = req.params.state.toUpperCase();

    
    const stateData = statesData.find(state => state.code === stateCode);

    

    
    const nickname = stateData.nickname;

    
    res.json({ state: stateData.state, nickname: nickname });
});

    //population
    router.get('/:state/population', verifyStates, (req, res) => {
        const stateCode = req.params.state.toUpperCase();
    
       
        const stateData = statesData.find(state => state.code === stateCode);
    
       
    
       
        const population = stateData.population;
    
        
        const populationWithCommas = population.toLocaleString();
    
        
        res.json({ state: stateData.state, population: populationWithCommas });
    });

    //admission
    router.get('/:state/admission', verifyStates, (req, res) => {
    const stateCode = req.params.state.toUpperCase();

   
    const stateData = statesData.find(state => state.code === stateCode);

   

    
    const admissionDate = stateData.admission_date;

    
    res.json({ state: stateData.state, admitted: admissionDate });
});












module.exports = router;

