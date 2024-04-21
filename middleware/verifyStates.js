const statesData = require('../models/statesData.json');
const State = require('../models/States');

const verifyStates = (req, res, next) => {
    
    const stateCodes = statesData.map(state => state.code.toUpperCase());

 
    const stateParameter = req.params.state.toUpperCase();

  
    if (!stateCodes.includes(stateParameter)) {
       
        return res.status(400).json({ error: "Invalid state abbreviation" });
    }

    
    req.code = stateParameter;

    
    next();
};

module.exports = verifyStates;