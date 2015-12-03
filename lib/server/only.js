'use strict';

let jpointer = require('json-pointer-rfc6901');

/*
 * Middleware to only return a subset of the resource(s).
 */

function only (req, res, next) {
    if (req.query.only) {
        // monkey patch
        let send = res.send;
        res.send = function (body) {
            // TODO
            return send.call(this, body);
        };
    }
        
    next();
}

module.exports = only;
