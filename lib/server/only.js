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
        return Promise.resolve(body);

    if (isSingletonResource(body) && typeof req.query.only === 'string') {
        let value = jpointer.get(body, req.query.only);
        if (!value)
            return Promise.resolve(null);

        // If scalar value, then decrypt.  If not classified, then decrypt
        // does nothing.
        if (typeof value !== 'object' && !Array.isArray(value)) {
            req.user.demand('view', body._metadata.self, req.query.only);
            return security.decryptAsync(value);
        }

        return Promise.resolve(value);
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

    return Promise.resolve(body);
}

module.exports = mung.jsonAsync(only);
