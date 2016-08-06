'use strict';

let l10n = require('./l10n'),
    log = require('log4js').getLogger('sendError'),
    peers = require('../pubsub');

function sendError (req, res, next) {
    res.sendError = (status, message, details) => {
        var stack;

        if (status instanceof Error && status.name === 'MongoError' && status.code == 11000) { // duplicate key
            message = 'duplicate key';
            details = status.message;
            status = 422;
        }
        else if (status instanceof SyntaxError && status.status === 400 && 'body' in status) {
            message = 'Bad Content';
            details = status.message;
            status = 400;
        }
        else if (status.response) {
            message = status.response.body.message;
            details = status.response.body.details || status.response.error;
            status = status.response.status || 500;
        }
        else if (status instanceof Error) {
            message = status.message;
            details = status.details || status.name;
            stack = status.stack.split('\n');
            status = status.status || 500;
        }

        if (typeof message === 'object' && message.message)
            message = message.message;

        // Publish internal server errors.
        if (status >= 500) {
            let pubmsg = {
                status: status,
                message: message,
                details: details,
                request: {
                    method: req.method,
                    host: req.headers.host,
                    url: req.originalUrl,
                },
                stack: stack
            };
            log.error(pubmsg);
            peers.publish('/yappy/error/server', pubmsg);
        }

        // Translate the message and then return the error.
        // console.log('message:', message);
        // console.log('details:', details);
        l10n
            .translate(req, message)
            .then(msg => {
                res
                    .status(status)
                    .set('Content-Language', msg.to)
                    .json({
                        message: msg.translation,
                        details: details || ''})
                    .end();
            });

        return null;
    };

    next();
}

module.exports = sendError;
