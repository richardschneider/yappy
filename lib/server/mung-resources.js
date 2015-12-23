'use strict';

let mung = require('express-mung'),
    resourcesIn = require('./utils').resourcesIn,
    containsResource = require('./utils').containsResource,
    isSingletonResource = require('./utils').isSingletonResource,
    Promise = require('bluebird');

/**
 * Allow other's to mung the resource(s).
 *
 * @param {Function} fn - fn(resource, req, res)
 */
mung.resources = function resources (fn) {

    function mungResources(body, req, res) {
        if (!containsResource(body)) {
            return body;
        }

        let isSingleton = isSingletonResource(body);

        // Munge the body.
        let resources = resourcesIn(body).map (r => {
            if (res.headersSent) return null;
            let original = r;
            r = fn(r, req, res);
            if (r === null) {
                return undefined;
            }
            if (r === undefined)
                r = original;
            return r;
        });
        if (res.headersSent) return null;

        // remove undefines and nulls
        resources = resources.filter(r => r);

        // If singleton and removed then 204 No Content
        if (isSingleton && resources.length === 0) {
            return null;
        }

        // Set the body to transform resource(s)
        if (isSingleton)
            body = resources[0];
        else
            body.data = resources;
        return body;
    }

    return mung.json(mungResources);
};

/**
 * Allow other's to mung the resource(s).
 *
 * @param {Function} fn - fn(resource, req, res)
 */
mung.resourcesAsync = function resourcesAsync (fn) {

    function mungResourcesAsync(body, req, res) {

        if (!containsResource(body)) {
            return Promise.resolve(body);
        }

        let isSingleton = isSingletonResource(body);

        return Promise
            // Munge the resource(s) in the body
            .map(resourcesIn(body), r => {
                if (res.headersSent) return null;
                let original = r;
                r = fn(r, req, res);
                if (r === null) {
                    return undefined;
                }
                if (r === undefined)
                    r = original;
                return r;
            })

            // remove undefines and nulls
            .filter(r => r)

            // get resources as an array
            .reduce((rs, r) => {
                rs.push(r);
                return rs;
            }, [])

            // return a new body with the new resources
            .then(resources => {
                if (res.headersSent) return null;

                // If singleton and removed then 204 No Content
                if (isSingleton && resources.length === 0) {
                    return null;
                }

                // Set the body to transform resource(s)
                if (isSingleton)
                    body = resources[0];
                else
                    body.data = resources;

                return body;
            });
    }

    return mung.jsonAsync(mungResourcesAsync);
};

module.exports = mung;
