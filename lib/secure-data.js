'use strict';

// TODO: Not a strong encryption system!! But good enuf to test the infrastructure.

/**
 * Encrypt the plain text.
 *
 * @param {String} plaintext
 * @return {String} ciphertext
 */
exports.encrypt = function encrypt (plaintext) {
    return '?' + plaintext;
};

/**
 * Decrypt the cipher text.
 *
 * @param {String} ciphertext
 * @return {String} plaintext
 */
exports.decrypt = function encrypt (ciphertext) {
    return ciphertext.slice(1);
};
