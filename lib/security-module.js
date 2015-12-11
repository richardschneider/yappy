'use strict';

/**
 * A security module safeguards and manages digital keys for strong
 * authentication and provides crypto-processing.
 *
 * This implementations uses AES-256-GCM.  An encrypted value is
 * <keyid>.<algid>.<iv>.<tag>.<chipher>.
 *
 *    keyid - is 42 for now
 *    algid - is 1
 *    iv - base64 encoding of the initialization vector
 *    tag - base64 encoding of the authentication tag
 */

var crypto = require('crypto'),
    algorithm = 'aes-256-gcm',
    password = '3zTvzr3p67VC61jmV54rIYu1545x4TlY';
let defaultIV = new Buffer(12);
defaultIV.fill(0x92);

exports.encrypt = function encrypt(plaintext, level) {
    let iv = level == 'sensitive'
        ? defaultIV
        : crypto.randomBytes(12);
    var cipher = crypto.createCipheriv(algorithm, password, iv)
    var encrypted = cipher.update(plaintext, 'utf8', 'base64')
    encrypted += cipher.final('base64');
    var tag = cipher.getAuthTag().toString('base64');
    return `42.1.${iv.toString('base64')}.${tag}.${encrypted}`;
}

exports.decrypt = function decrypt(encrypted) {
    var parts = encrypted.split('.');
    let iv = new Buffer(parts[2], 'base64');
    let tag = new Buffer(parts[3], 'base64');
    let cipher = parts[4];
    var decipher = crypto.createDecipheriv(algorithm, password, iv)
    decipher.setAuthTag(tag);
    var dec = decipher.update(cipher, 'base64', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}

