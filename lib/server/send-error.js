'use strict';

function sendError (req, res, next) {
    if (!res) return next();
    
    res.sendError = (status, message, details) => {
      res
        .status(status)
        .json({message: message, details: details})
        .end(); 
    };
    next();
}

module.exports = sendError;