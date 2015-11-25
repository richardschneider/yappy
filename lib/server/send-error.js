'use strict';

let l10n = require('./l10n');

function sendError (req, res, next) {
    if (!res) return next();
    
    res.sendError = (status, message, details) => {
        if (status instanceof Error && status.name === 'MongoError' && status.code == 11000) { // duplicate key
            message = 'duplicate key';
            details = status.message;
            status = 422;
        }
        else if (status.response) {
            message = status.response.body.message;
            details = status.response.body.details || status.response.error;
            status = status.response.status || 500;
        }
        else if (status instanceof Error) {
            message = status.message;
            details = status.details || status.name;
            status = 500;
        }
        
        // console.log('message:', message);
        // console.log('details:', details);
        l10n.translate(req, message)
        .then(msg => {
            res
                .status(status)
                .set('Content-Language', msg.to)
                .json({
                    message: msg.translation,
                    details: details || ''})
                .end(); 
        });
    };
    next();
}

module.exports = sendError;