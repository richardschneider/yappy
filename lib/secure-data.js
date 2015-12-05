'use strict';

// TODO: Not a strong encryption system!! But good enuf to test the infrastructure.

let privacyMessage = '\u009e';

/**
 * Encrypt the plain text.
 *
 * All cipher text begins with U+009E PRIVACY MESSAGE.
 *
 * @param {String} plaintext
 * @return {String} ciphertext
 */
exports.encrypt = function encrypt (plaintext) {
    let ciphertext = privacyMessage + plaintext;
    return ciphertext;
};

/**
 * Decrypt the cipher text.
 *
 * @param {String} ciphertext
 * @return {String} plaintext
 */
exports.decrypt = function decrypt (ciphertext) {
    if (!ciphertext.startsWith(privacyMessage))
        return ciphertext;

    return ciphertext.slice(1);
};
