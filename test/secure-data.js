'use strict';

require('should');
let security = require('../lib/secure-data');

describe ('Security', () => {

    it('should decrypt a cipher text', done => {
        let plain = 'some plain text';
        security.encryptAsync(plain)
            .then(security.decryptAsync)
            .then(plaintext => {
                plaintext.should.equal(plain);
                done();
            })
            .catch(done);
    });

    it('should ensure cipher text is not equal to plain text', done => {
        let plain = 'some plain text';
        security.encryptAsync(plain)
            .then(ciphertext => {
                ciphertext.should.not.equal(plain);
                done();
            })
            .catch(done);
    });

    it('should not decrypt plain text', done => {
        let plain = 'some plain text';
        security.decryptAsync(plain)
            .then(plaintext => {
                plaintext.should.equal(plain);
                done();
            })
            .catch(done);
    });

    it('should not re-encrypt cipher text', done => {
        let plain = 'some plain text';
        security.encryptAsync(plain)
            .then(security.encryptAsync)
            .then(security.encryptAsync)
            .then(security.encryptAsync)
            .then(security.decryptAsync)
            .then(plaintext => {
                plaintext.should.equal(plain);
                done();
            })
            .catch(done);
    });

    it('should distinguish plain from cipher text', (done) => {
        let plain = 'some plain text';
        security.isPlaintext(plain).should.be.true;
        security.isCiphertext(plain).should.false;

        security.encryptAsync(plain)
            .then (cipher => {
                security.isPlaintext(cipher).should.be.false;
                security.isCiphertext(cipher).should.true;
                done();
            })
            .catch(done);
    });

    it('should encrypt classified fields', done => {
        let r = {
            'unclassified': 'unclassified',
            '*restricted': 'restricted',
            '~sensitive': 'sensitive',
            '!secret': 'secret',
            '^top-secret': 'top-secret'
        };
        security.encryptAsync(r)
            .then(cipher => {
                cipher['*restricted'].should.equal('restricted');
                cipher['~sensitive'].should.not.equal('sensitive');
                cipher['!secret'].should.not.equal('secret');
                cipher['^top-secret'].should.not.equal('top-secret');
                done();
            })
            .catch(done);
    });

});
