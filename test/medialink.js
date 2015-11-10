'use strict';

var should = require('should');
var schema = require('js-schema-6901');
var medialink = require('../lib/model/medialink');


describe('Media Link data type', function () {
    let image = schema({
       href: medialink
    });    

    it('has the form "/api/media/<id>/content"', function (done) {
        image({ href: "/api/media/1" }).should.be.false;
        image({ href: "/api/media/1/content" }).should.be.true;
        done();
    });
   

});
