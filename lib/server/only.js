'use strict';

let jpointer = require('json-pointer-rfc6901'),
    mung = require('express-mung'),
    security = require('../secure-data'),
    resourcesIn = require('./utils').resourcesIn,
    containsResource = require('./utils').containsResource,
    toSearchResult = require('./utils').toSearchResult,
    isSingletonResource = require('./utils').isSingletonResource;

/*
 * Middleware to only return a subset of the resource's properties.
 */

function only (body, req, res) {
    if (!req.query.only || !containsResource(body))
        return body;

    if (isSingletonResource(body) && typeof req.query.only === 'string') {
        let value = jpointer.get(body, req.query.only);
        if (!value)
            return null;

        // If scalar value
        if (typeof value !== 'object' && !Array.isArray(value)) {
                    return security.decrypt(value)
                        .then(plain => send.call(this, plain));
        }

        return value;
    }

    if (isSingletonResource(body))
        body = toSearchResult(req, body);

    let pointers = typeof req.query.only === 'string' ? [req.query.only] : req.query.only;
    body.data = resourcesIn(body)
        .map(r => {
            let subset = { _metadata: r._metadata };
            subset._metadata.partial = true;
            for (let pointer of pointers) {
                let value = jpointer.get(r, pointer);
                subset[pointer] = value;
            }
            return subset;
        });

    return body;
}


module.exports = mung.json(only);
