'use strict';

var should = require('should');
var schema = require('js-schema');
var link = require('../lib/model/link');


describe('Link data type', function () {
    let image = schema({
       href: link
    });    

    it('starts with "/api/<type>/<id>"', function (done) {
        image({ href: "/foo/bear/1" }).should.be.false;
        image({ href: "/api/bear/1" }).should.be.true;
        done();
    });
   

});
