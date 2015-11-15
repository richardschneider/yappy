'use strict';

function sendError (req, res, next) {
    if (!res) return next();
    
    res.sendError = (status, message, details) => {
        if (status instanceof Error && status.name === 'MongoError' && status.code == 11000) { // duplicate key
            res
                .status(422)
                .json({message: 'duplicate key', details: status.message})
                .end();
        }
        else if (status instanceof Error) {
            console.error(status);
            console.error(status.stack);
            res
                .status(500)
                .json({message: status.message, details: status.name})
                .end();
        } else {     
            res
                .status(status)
                .json({message: message, details: details})
                .end(); 
        }
    };
    next();
}

module.exports = sendError;