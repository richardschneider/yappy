'use strict';

let jpath = require('JSONPath');
let jpointer = require('json-pointer-rfc6901');

/*
 * Middleware to remove resources that the user is not permitted to view.
 */

function removeRestrictedResources(doc, req, res) {

    // Find all resources in the document.  A resource must have '_metadata'
    // with the 'self' and 'type' properties.
    let pointers = jpath({
        json: doc,
        path: '$..[?(@._metadata && @._metadata.self && @._metadata.type)]',
        resultType: 'pointer',
        flatten: true
    });

    // Remove any resources that are not viewable.
    pointers.forEach(pointer => {
        let resource = jpointer.get(doc, pointer);
        if (!req.user.isPermittedToView(resource._metadata.self)) {
            jpointer.del(doc, pointer);
        }
    });

    return doc;
}


function resource_check (req, res, next) {
    // monkey patch
    let send = res.send;
    res.send = function (body) {
        body = removeRestrictedResources(body, req, res);
        return send.call(this, body);
    };

    next();
}

resource_check.removeRestrictedResources = removeRestrictedResources;

module.exports = resource_check;
