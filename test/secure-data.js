'use strict';

require('should');
let security = require('../lib/secure-data');

describe ('Security', () => {

    it('should decrypt a cipher text', () => {
        let plain = 'some plain text';
        let cipher = security.encrypt(plain);
        security.decrypt(cipher).should.equal(plain);
    });

    it('should ensure cipher text is not equal to plain text', () => {
        let plain = 'some plain text';
        let cipher = security.encrypt(plain);
        cipher.should.not.equal(plain);
    });

    it('should not decrypt plain text', () => {
        let plain = 'some plain text';
        security.decrypt(plain).should.equal(plain);
    });

    it('should not re-encrypt cipher text', () => {
        let plain = 'some plain text';
        let cipher1 = security.encrypt(plain);
        let cipher2 = security.encrypt(cipher1);
        cipher1.should.not.equal(plain);
        cipher2.should.equal(cipher1);
    });

    it('should distinguish plain from cipher text', () => {
        let plain = 'some plain text';
        security.isPlaintext(plain).should.be.true;
        security.isCiphertext(plain).should.false;

        let cipher = security.encrypt(plain);
        security.isPlaintext(cipher).should.be.false;
        security.isCiphertext(cipher).should.true;
    });

    it('should encrypt classified fields', () => {
        let r = {
            'unclassified': 'unclassified',
            '*restricted': 'restricted',
            '~sensitive': 'sensitive',
            '!secret': 'secret',
            '^top-secret': 'top-secret'
        };
        let cipher = security.encrypt(r);
        cipher['*restricted'].should.equal('restricted');
        cipher['~sensitive'].should.not.equal('sensitive');
        cipher['!secret'].should.not.equal('secret');
        cipher['^top-secret'].should.not.equal('top-secret');
    });

});
