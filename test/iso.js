'use strict';

var should = require('should');
var schema = require('js-schema-6901');
var iso = require('../lib/model/iso');

describe('ISO date', function () {
    let x = schema({
       on: iso.date
    });    

    it('should have the form YYYY-MM-DD', function (done) {
        x({ on: "2015-08-13" }).should.be.true;
        x({ on: "08-13-2015" }).should.be.false;
        x({ on: "2015-08-13T01:00:00Z" }).should.be.false;
        done();
    });
});

describe('ISO date time', function () {
    let x = schema({
       on: iso.dateTime
    });    

    it('should be relative to UTC', function (done) {
        x({ on: "2015-08-13T01:00:00Z" }).should.be.true;
        x({ on: "2015-08-13T01:00:00" }).should.be.false;
        x({ on: "2015-08-13T01:00:00+12" }).should.be.false;
        done();
    });

    it('should allow 1-6 optional fractions', function (done) {
        x({ on: "2015-08-13T01:00:00.1Z" }).should.be.true;
        x({ on: "2015-08-13T01:00:00.12Z" }).should.be.true;
        x({ on: "2015-08-13T01:00:00.123Z" }).should.be.true;
        x({ on: "2015-08-13T01:00:00.1234Z" }).should.be.true;
        x({ on: "2015-08-13T01:00:00.12345Z" }).should.be.true;
        x({ on: "2015-08-13T01:00:00.123456Z" }).should.be.true;
        x({ on: "2015-08-13T01:00:00.Z" }).should.be.false;
        x({ on: "2015-08-13T01:00:00.1234567Z" }).should.be.false;
        done();
    });

});
