'use strict';

let jpointer = require('json-pointer-rfc6901'),
    contentType = require('content-type'),
    iconv = require('iconv-lite'),
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
    let end = res.end;
    res.end = function () {
        res.end = end; // unhook

        // The resource(s) is JSON encoded in a Buffer. To be processed it
        // must be 'application/json' and contain a resource(s).
        let data = arguments[0];
        if (res.statusCode >= 400 || !data || !Buffer.isBuffer(data)) {
            return end.apply(this, arguments);
        }
        let mime = contentType.parse(res);
        if (mime.type != 'application/json') {
            return end.apply(this, arguments);
        }
        let encoding = arguments[1] || mime.parameters.charset;
        let body = JSON.parse(iconv.decode(data, encoding));
        if (!containsResource(body)) {
            return end.apply(this, arguments);
        }

        let isSingleton = isSingletonResource(body);

        // A res.end inside of the pipeline aborts.
        let abort = false;
        res.end = function () {
            return abort = end.apply(this, arguments) || true;
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

        // If aborted, then give up.
        res.end = end; // unhook
        if (abort)
            return abort;

        // remove undefines and nulls
        resources = resources.filter(r => r);

        // If singleton and removed then 204 No Content
        if (isSingleton && resources.length === 0)
            return res.status(204).end();

        // Return the results.
        if (isSingleton)
            body = resources[0];
        else
            body.data = resources;
        data = iconv.encode(JSON.stringify(body), encoding);
        return end.call(this, data);
    };

    next && next();
}

module.exports = mung;
