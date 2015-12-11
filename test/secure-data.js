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

    it('should allow equal searching on sensitive data', done => {
        let r = {
            '~1': 'sensitive',
            '~2': 'sensitive',
            '~3': 'very sensitive',
        };
        security.encryptAsync(r)
            .then(cipher => {
                cipher['~1'].should.equal(cipher['~2']);
                cipher['~1'].should.not.equal(cipher['~3']);
                done();
            })
            .catch(done);
    });

    it('should not allow equal searching on sensitive data', done => {
        let r = {
            '!1': 'secret',
            '!2': 'secret',
            '!3': 'very secret',
        };
        security.encryptAsync(r)
            .then(cipher => {
                cipher['!1'].should.not.equal(cipher['!2']);
                cipher['!1'].should.not.equal(cipher['!3']);
                done();
            })
            .catch(done);
    });

    it('should determine the security level from a field name', () => {
        security.securityLevelOf('foobar').should.equal('unclassified');
        security.securityLevelOf('*foobar').should.equal('restricted');
        security.securityLevelOf('~foobar').should.equal('sensitive');
        security.securityLevelOf('!foobar').should.equal('secret');
        security.securityLevelOf('^foobar').should.equal('top-secret');
    });

    it('should determine the security level from a JSON pointer', () => {
        security.securityLevelOf('/a/foobar').should.equal('unclassified');
        security.securityLevelOf('/a/*foobar').should.equal('restricted');
        security.securityLevelOf('/a/~0foobar').should.equal('sensitive');
        security.securityLevelOf('/a/!foobar').should.equal('secret');
        security.securityLevelOf('/a/^foobar').should.equal('top-secret');
    });

    describe('Encrypted value', () => {
        let cipher;
        before(done => {
            let plain = 'some plain text';
            security.encryptAsync(plain)
                .then(ciphertext => {
                    console.log(ciphertext)
                    cipher = ciphertext;
                    done();
                })
                .catch(done);

        });

        it('should start with the Privacy Message \u009e', () => {
            cipher.should.startWith('\u009e');
        });

        it('should then have the key id followed by "."', () => {
            let parts = cipher.split('.');
            parts.length.should.be.above(0);
        });

        it('should then have the algorithm number followed by "."', () => {
            let parts = cipher.split('.');
            parts.length.should.be.above(1);
        });

        it('should end with the base64 encoding of the cipher text', () => {
            let parts = cipher.split('.');
            parts.length.should.be.above(2);
        });

    });

});
