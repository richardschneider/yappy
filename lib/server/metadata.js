'use strict';

let mung = require('express-mung');

/*
 * Middleware to add and remove metadata.
 */

function addMetadata(o, req, res) {
    if (!req.dataModel)
        return o;

    let original = o;
    if (o.data)
        o = o.data;

    if (Array.isArray(o)) {
        o.forEach(e => addMetadata(e, req, res));
        return original;
    }
    if (o === null || typeof o !== 'object')
        return o;
    o._metadata = o._metadata || {};
    if (!o._metadata.self) {
        let url = res._headers.location
            ? res._headers.location
            : '/api/' + req.dataModel.name + '/' + o._id;
        o._metadata.self = url;
        o._metadata.type = req.dataModel.name;
    }
    o._id = undefined;
    return o;
}

function removeMetadata(o) {
    if (o.data)
        o = o.data;
    if (Array.isArray(o)) {
        o.forEach(e => removeMetadata(e));
        return;
    }
    if (o !== null && typeof o === 'object' && o._metadata)
        o._metadata = undefined;

    return o;
}

function metadata (req, res, next) {
    // Strip metadata from incoming resource.
    removeMetadata(req.body);

    // Add metadata to outgoing resource.
    mung.json(addMetadata)(req, res);

    next();
}

module.exports = metadata;
