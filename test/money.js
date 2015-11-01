'use strict';

var should = require('should');
var schema = require('js-schema');
var money = require('../server/model/money');


describe('Money data type', function () {

    it('has a 3 character (ISO 4217) currency code', function (done) {
        money.validate({ amount: '1.00' }).error.should.not.be.null;
        money.validate({ code: '', amount: "1.00" }).error.should.not.be.null;
        money.validate({ code: 'N', amount: "1.00" }).error.should.not.be.null;
        money.validate({ code: 'NZ', amount: "1.00" }).error.should.not.be.null;
        money.validate({ code: 'NZD', amount: "1.00" }).should.have.property('error', null);
        done();
    });
   
    it('ISO 4217 currency code is upper case', function (done) {
        money.validate({ code: 'NZD', amount: "1.00" }).should.have.property('error', null);
        money.validate({ code: 'nzd', amount: "1.00" }).error.should.not.be.null;
        done();
    });

    it('has an integer or decimal amount with 4 digits of precision', function (done) {
        money.validate({ code: 'NZD' }).error.should.not.be.null;
        money.validate({ code: 'NZD', amount: "" }).error.should.not.be.null;
        money.validate({ code: 'NZD', amount: "one" }).error.should.not.be.null;
        money.validate({ code: 'NZD', amount: "1" }).should.have.property('error', null);
        money.validate({ code: 'NZD', amount: "1.1" }).should.have.property('error', null);
        money.validate({ code: 'NZD', amount: "1.12" }).should.have.property('error', null);
        money.validate({ code: 'NZD', amount: "1.1234" }).should.have.property('error', null);
        money.validate({ code: 'NZD', amount: "1.12345" }).error.should.not.be.null;
        done();
    });

    
});
