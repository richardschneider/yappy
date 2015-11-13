'use strict';

/*
 * Middleware to add and remove metadata.
 */
 
function addMetadata(o, req, res) {
    if (!req.dataModel)
        return o;
    if (Array.isArray(o)) {
        o.forEach(e => addMetadata(e, req, res));
        return o;
    }
    if (o === null || typeof o !== 'object')
        return o;
    var url = res._headers.location 
        ? res._headers.location
        : '/api/' + req.dataModel.name + '/' + o._id;
    o._metadata = {
        self: url,
        type: req.dataModel.name
    };
    o._id = undefined;
    return o;
}

function removeMetadata(o) {
    if (Array.isArray(o)) {
        o.forEach(e => removeMetadata(e));
        return;
    }
    if (o !== null && typeof o === 'object')
        o._metadata = undefined;
    
    return o;
}

function metadata (req, res, next) {
    // monkey patch res.send to add metadata.
    let send = res.send;
    res.send = function (body) {
        addMetadata(body, req, res);
        return send.call(this, body);
    };

    // Strip metadata from incoming resource.
    removeMetadata(req.body);
        
    next();
}

module.exports = metadata;