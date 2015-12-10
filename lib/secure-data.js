'use strict';

let jpath = require('JSONPath'),
    jpointer = require('json-pointer-rfc6901'),
    Promise = require('bluebird'),
    security_module = require('./security-module');

// TODO: Not a strong encryption system!! But good enuf to test the infrastructure.

let privacyMessage = '\u009e';
let classified = '$..[?(@path.includes("[\'~") || @path.includes("[\'!") || @path.includes("[\'\\*") || @path.includes("[\'\\^"))]';
let encrypted = '$..[?(@path.includes("[\'~") || @path.includes("[\'!")  || @path.includes("[\'\\^"))]';
let classifiedRegex = /"[\~\!\*\^]/;
let encryptedRegex = /"[\~\!\]]/;
let classifiedPathRegex = /\/[\~\!\*\^]/;
let encryptedPathRegex = /\/[\~\!\^]/;

exports.redaction_mask = '\u2588\u2588\u2588\u2588\u2588\u2588\u2588';

/**
 * Get the classiefied fields of an object as an array of JSON Pointers.
 */
exports.classifiedFields = function classifiedFields(o) {
    // if a request
    if (o && o.contains && o.body) {
        if (!o.contains(classifiedRegex))
            return [];
        o = o.body;
    }
    return jpath({
        json: o,
        path: classified,
        resultType: 'pointer',
        flatten: true});
};

/**
 * Get the encrypted fields of an object as an array of JSON Pointers.
 */
exports.encryptedFields = function encryptedFields(o) {
    // if a request
    if (o && o.contains && o.body) {
        if (!o.contains(encryptedRegex))
            return [];
        o = o.body;
    }
    return jpath({
        json: o,
        path: encrypted,
        resultType: 'pointer',
        flatten: true});
};

/**
 * Encrypt the plain text or the classified fields of an object.
 *
 * All cipher text begins with U+009E PRIVACY MESSAGE.
 *
 * @param {String|Object} plaintext
 * @return Promise{String|Objet} ciphertext
 */
exports.encryptAsync = function encryptAsync (plaintext) {
    if (typeof plaintext === 'object') {
        let fields = [];
        let o = plaintext;
        exports.encryptedFields(o).forEach(p => {
            let promise = exports.encryptAsync(jpointer.get(o, p))
                .then(ciphertext => jpointer.set(o, p, ciphertext));
            fields.push(promise);
        });

        return Promise.all(fields).then(() => o); // TODO: Promise.map might be better
    }

    if (exports.isCiphertext(plaintext))
        return Promise.resolve(plaintext);

    let ciphertext = privacyMessage + security_module.encrypt(plaintext);
    return Promise.resolve(ciphertext);
};

/**
 * Encrypt the classified fields of the JSON Patch document.
 */
exports.encryptJSONPatchAsync = function encryptJSONPatchAsync(patches) {
    let promise = Promise.resolve(true);
    for (let patch of patches) {
        if (patch.path && patch.value && exports.isEncryptedPath(patch.path)) {
            promise
                .then(() => exports.encryptAsync(patch.value))
                .then(cipher => { patch.value = cipher });
        }
    }

    return promise.then(() => patches);
};

/**
 * Decrypt the cipher text.
 *
 * @param {String} ciphertext
 * @return Promise{String} plaintext
 */
exports.decryptAsync = function decryptAsync (ciphertext) {
    if (exports.isPlaintext(ciphertext))
        return Promise.resolve(ciphertext);

    return Promise.resolve(security_module.decrypt(ciphertext.slice(1)));
};

/**
 * Determines if the text is already encrypted.
 *
 * @param {String} a plain or cipher text
 * @return {Boolean} true if encrypted; otherwise, false.
 */
exports.isCiphertext = function isCiphertext (text) {
    return text.startsWith(privacyMessage);
};

/**
 * Determines if the text is not encrypted.
 *
 * @param {String} a plain or cipher text
 * @return {Boolean} true if plain; otherwise, false for encrypted.
 */
exports.isPlaintext = function isCiphertext (text) {
    return !exports.isCiphertext(text);
};

/**
 * Determines if the JSON path should have a encrypted value.
 *
 * @param {String} path
 * @return {Boolean} true if should be encrypted; otherwise, false.
 */
exports.isEncryptedPath = function isEncryptedPath (path) {
    return path.search(encryptedPathRegex) !== -1;
};
