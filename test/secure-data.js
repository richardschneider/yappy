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


});
