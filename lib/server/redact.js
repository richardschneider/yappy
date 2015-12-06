'use strict';

let jpointer = require('json-pointer-rfc6901'),
    mung = require('./mung-resources'),
    security = require('../secure-data');

/**
 * Replace any classified fields with the redaction mask.
 *
 * _metadata.redactions contains the keys of the classiefied fields
 * and the value is a URL to get plain-text value of the redacted
 * field.
 *
 */
function redactDocument(doc, req, res)
{
    let metadata = doc[redact.metadataName] = doc[redact.metadataName] || {};
    security.classifiedFields(doc).forEach(pointer => {
        let redactions = metadata.redactions = metadata.redactions || {};
        jpointer.set(doc, pointer, redact.mask);
        redactions[pointer] = metadata.self + '?only=' + pointer;
    });

    return doc;
}

/**
 * Middleware to redact, block-out sensistive information, a document.
 */
function redact (req, res, next) {
    /**
     * Detemines if the request's body contains the string.  TODO move somewhere else
     */
    req.contains = s => {
        req.text = req.text || JSON.stringify(req.body);
        if (typeof s === 'string')
            return req.text.indexOf(s) !== -1;
        if (s instanceof RegExp)
            return req.text.matches(s);
    };

    mung.resources(redactDocument)(req, res);

    if (req.method == 'POST' || req.method == 'PUT' || req.method == 'PATCH') {
        if (req.contains(redact.mask[0]))
            return res.sendError(422, "Cannnot create/update a redacted resource");

        if (req.method == 'PATCH')
            security.encryptJSONPatch(req.body);
        else
            return security.encrypt(req.body).then(() => next());
    }

    next();
}

redact.document = redactDocument;
redact.mask = security.redaction_mask;
redact.metadataName = '_metadata';

module.exports = redact;
