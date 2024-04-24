const express = require('express');
const router = express.Router();
const { getCapital, getNickname, getPopulation, getAdmission, getState, getAllStates, addFunFacts, getRandomFunFact, updateFunFact, deleteFunFact} = require('../controllers/stateController');
const verifyStates = require('../middleware/verifyStates');
const statesData = require('../models/statesData.json');

router.get('/:state', verifyStates, getState);
router.get('/', getAllStates);
router.get('/:state/capital', verifyStates, getCapital);
router.get('/:state/nickname', verifyStates, getNickname); 
router.get('/:state/population', verifyStates, getPopulation);   
router.get('/:state/admission', verifyStates, getAdmission);
router.get('/:state/funfact', verifyStates, getRandomFunFact);
router.post('/:state/funfact', verifyStates, addFunFacts);
router.patch('/:state/funfact', verifyStates, updateFunFact);
router.delete('/:state/funfact', verifyStates, deleteFunFact);


   



module.exports = router;

