'use strict';

let jpath = require('JSONPath');
let jpointer = require('json-pointer-rfc6901');

/*
 * Middleware to redact, block-out sensistive information, a document.
 */

function allowUpdate(doc, req, res) {
    let hasRedactions =
        doc &&
        ['PUT', 'POST'].find(m => m === req.method) &&
        doc[redact.metadataName] &&
        doc[redact.metadataName].redactions;
    return !hasRedactions;
}

function redactDocument(doc, req, res)
{
    if (!doc) return doc;

    // For search results, we want to deal individually with each result
    // so that the redaction details are placed in the correct
    // object.  Without the follow are redaction details will appear in the
    // metadata of the top-level document, not the individual resource.
    let original = doc;
    if (doc.data)
        doc = doc.data;

    if (Array.isArray(doc)) {
        doc.forEach(e => redactDocument(e, req, res));
        return original;
    }

    let matches = jpath({json: doc, path: '$..apikey', resultType: 'pointer', flatten: true});
    if (matches.length > 0)
    {
        let metadata = doc[redact.metadataName] = doc[redact.metadataName] || {};
        let redactions = metadata.redactions = {};
        matches.forEach(pointer => {
            jpointer.set(doc, pointer, redact.mask);
            redactions[pointer] = 'replaced';
        });
    }
    return original;
}

function redact (req, res, next) {
    let send = res.send;
    res.send = function (body) {
        body = redactDocument(body, req, res);
        return send.call(this, body);
    };

    if (!allowUpdate(req.body, req, res))
        return res.sendError(501, "Updating a redacted resource is not yet implemented");

    next();
}

redact.document = redactDocument;
redact.allowUpdate = allowUpdate;
redact.mask = '\u2588\u2588\u2588\u2588\u2588\u2588';
redact.metadataName = '_metadata';

module.exports = redact;
