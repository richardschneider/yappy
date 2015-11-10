'use strict';

var should = require('should');
var schema = require('js-schema-6901');
var money = require('../lib/model/money');


describe('Money data type', function () {

    it('has a 3 character (ISO 4217) currency code', function (done) {
        money({ amount: '1.00' }).should.be.false;
        money({ code: '', amount: "1.00" }).should.be.false;
        money({ code: 'N', amount: "1.00" }).should.be.false;
        money({ code: 'NZ', amount: "1.00" }).should.be.false;
        money({ code: 'NZD', amount: "1.00" }).should.be.true;
        done();
    });
   
    it('ISO 4217 currency code is upper case', function (done) {
        money({ code: 'NZD', amount: "1.00" }).should.be.true;
        money({ code: 'nzd', amount: "1.00" }).should.be.false;
        done();
    });

    it('has an integer or decimal amount with 4 digits of precision', function (done) {
        money({ code: 'NZD' }).should.be.false;
        money({ code: 'NZD', amount: "" }).should.be.false;
        money({ code: 'NZD', amount: "one" }).should.be.false;
        money({ code: 'NZD', amount: "1" }).should.be.true;
        money({ code: 'NZD', amount: "1.1" }).should.be.true;
        money({ code: 'NZD', amount: "1.12" }).should.be.true;
        money({ code: 'NZD', amount: "1.1234" }).should.be.true;
        money({ code: 'NZD', amount: "1.12345" }).should.be.false;
        done();
    });

    
});
