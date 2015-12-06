'use strict';

let jpointer = require('json-pointer-rfc6901'),
    resourcesIn = require('./utils').resourcesIn,
    containsResource = require('./utils').containsResource,
    isSingletonResource = require('./utils').isSingletonResource;


/*
 * Middleware to transform a resource.  To hook into the pipeline
 *
 *     res.mung(function my_mung(resource, res, resp) { do something });
 *
 * returning null from my_mung will remove the resource.
 */

function mung (req, res, next) {
    let mungers = [];
    res.mung = f => mungers.push(f);

    /**
     * Detemines if the request's body contains the string.
     */
    req.contains = s => {
        req.text = req.text || JSON.stringify(req.body);
        if (typeof s === 'string')
            return req.text.indexOf(s) !== -1;
        if (s instanceof RegExp)
            return req.text.matches(s);
    };

    // monkey patch
    let send = res.send;
    res.send = function (body) {

        // If not a resource, then stop.
        if (res.statusCode >= 400 || !containsResource(body)) {
            res.send = send; // unhook
            return res.send(body);
        }

        let isSingleton = isSingletonResource(body);

        // A res.send inside of the pipeline aborts.
        let abort = false;
        res.send = function () {
            return abort = send.apply(this, arguments) || true;
        };

        // Mung the resource(s)
        let resources = resourcesIn(body).map (r => {
            for (let i = mungers.length - 1; 0 <= i && !abort; --i) {
                let original = r;
                r = mungers[i](r, req, res);
                if (r === null) {
                    return undefined;
                }
                if (r === undefined)
                    r = original;
            }
            return r;
        });

        res.send = send; // unhook
        if (abort)
            return abort;

        // remove undefines and nulls
        resources = resources.filter(r => r);

        // If singleton and removed then 204 No Content
        if (isSingleton && resources.length === 0)
            return res.status(204);

        // Return the results.
        if (isSingleton)
            body = resources[0];
        else
            body.data = resources;
        return send.call(this, body);
    };

    next && next();
}

module.exports = mung;
