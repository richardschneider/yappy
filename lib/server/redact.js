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
    for (let path of redact.jsonPaths)
    {
        let matches = jpath({
            json: doc,
            path: path,
            resultType: 'pointer',
            flatten: true});
        if (matches.length > 0)
        {
            let metadata = doc[redact.metadataName] = doc[redact.metadataName] || {};
            let redactions = metadata.redactions = {};
            matches.forEach(pointer => {
                jpointer.set(doc, pointer, redact.mask);
                redactions[pointer] = metadata.self + '?only=' + pointer;
            });
        }
    }

    return doc;
}

function redact (req, res, next) {
    res.mung(redactDocument);

    if (!allowUpdate(req.body, req, res))
        return res.sendError(501, "Updating a redacted resource is not yet implemented");

    next();
}

redact.document = redactDocument;
redact.allowUpdate = allowUpdate;

redact.mask = '\u2588\u2588\u2588\u2588\u2588\u2588';
redact.jsonPaths = [
    '$..[?(@path.includes("[\'~") || @path.includes("[\'!"))]'
    ];
redact.metadataName = '_metadata';

module.exports = redact;
