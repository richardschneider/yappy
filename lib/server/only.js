'use strict';

let jpointer = require('json-pointer-rfc6901'),
    resourcesIn = require('./utils').resourcesIn,
    containsResource = require('./utils').containsResource,
    toSearchResult = require('./utils').toSearchResult,
    isSingletonResource = require('./utils').isSingletonResource;

/*
 * Middleware to only return a subset of the resource's properties.
 */

function only (req, res, next) {
    if (req.query.only) {
        // monkey patch
        let send = res.send;
        res.send = function (body) {
            res.send = send; // unhook
            if (!containsResource(body)) return send.call(this, body);

            if (isSingletonResource(body) && typeof req.query.only === 'string') {
                let subset = jpointer.get(body, req.query.only);
                if (!subset)
                    return res.status(204);
                if (typeof subset !== 'object' && !Array.isArray(subset))
                    res.set('content-type', 'text/plain');
                return send.call(this, subset);
            }

            if (isSingletonResource(body))
                body = toSearchResult(req, body);

            let pointers = typeof req.query.only === 'string' ? [req.query.only] : req.query.only;
            body.data = resourcesIn(body)
                .map(r => {
                    let subset = { _metadata: r._metadata };
                    subset._metadata.partial = true;
                    for (let pointer of pointers) {
                        subset[pointer] = jpointer.get(r, pointer);
                    }
                    return subset;
                });
            return send.call(this, body);
        };
    }

    next();
}

module.exports = only;
