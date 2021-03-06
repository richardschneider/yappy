'use strict';

var request = require("./my-supertest");
var should = require('should');
var server = require('../lib/server');

server.timeout = 10000;


describe('Compression', function () {
 
    it('should compress response when asked', function (done) {
        request(server)
            .get('/api-test/random')
            .set('accept-encoding', 'gzip')
            .expect('content-encoding', 'gzip')
            .end(done);            
    });
   
    it('should not compress response when not asked', function (done) {
        request(server)
            .get('/api-test/random')
            .set('accept-encoding', null)
            .expect(function (res) {
                res.header.should.not.have.property('content-encoding');
            })
            .end(done);            
    });

});
