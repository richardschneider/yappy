'use strict';

var should = require('should');
var schema = require('js-schema-6901');
var subdomain = require('../lib/model/subdomain');


describe('Subdomain data type', function () {
    let tenant = schema({
       domain: subdomain
    });    

    it('should be between 1 and 63 characters long', function () {
        tenant({ domain: 'z' }).should.be.true;
        tenant({ domain: 'z12345678901234567890123456789012345678901234567890123456789012' }).should.be.true;
        tenant({ domain: 'z123456789012345678901234567890123456789012345678901234567890123' }).should.be.false;
    });
   
    it('should not contain any whitespace at all', function () {
        tenant({ domain: 'a-to-z' }).should.be.true;
        tenant({ domain: 'a to z' }).should.be.false;
    });

    it('should contain only lowercase characters a-z, digits 0-9 or the dash character', function () {
        tenant({ domain: 'a-z' }).should.be.true;
        tenant({ domain: 'a0-9' }).should.be.true;
        tenant({ domain: 'A-Z' }).should.be.false;
    });

    it('should not start with or end with a dash', function () {
        tenant({ domain: 'dash-dash' }).should.be.true;
        tenant({ domain: '-dash-dash' }).should.be.false;
        tenant({ domain: 'dash-dash-' }).should.be.false;
    });
    
    it('should not start with a digit', function () {
        tenant({ domain: 'alpha-1' }).should.be.true;
        tenant({ domain: '1-alpha' }).should.be.false;
    });

});
