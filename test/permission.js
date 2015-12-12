'use strict';

var should = require('should');
var schema = require('js-schema-6901');
var permission = require('../lib/model/permission');


describe('Permission data type', function () {
    let x = schema({
       p: permission
    });

    it('should start with a scope', function (done) {
        x({ p: "api" }).should.be.true;
        x({ p: "api:" }).should.be.false;
        done();
    });

    it('should allow wildcard', function (done) {
        x({ p: "*" }).should.be.true;
        x({ p: "api:*" }).should.be.true;
        x({ p: "api:customer:*" }).should.be.true;
        x({ p: "api*" }).should.be.false;
        x({ p: "api:customer*" }).should.be.false;
        done();
    });

    it('should allow many levels', function (done) {
        x({ p: "api:customer:view:123" }).should.be.true;
        x({ p: "api:customer:view:123:dob:year" }).should.be.true;
        x({ p: "api:customer:view:123:" }).should.be.false;
        x({ p: "api:customer:view:123:dob:year:" }).should.be.false;
        done();
    });


})