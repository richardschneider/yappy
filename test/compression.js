'use strict';

var request = require("supertest-as-promised");
var should = require('should');
var server = require('../lib/server');

server.timeout = 10000;


describe('Compression', function () {
 
    it('compresses response when asked', function (done) {
        request(server)
            .get('/api/bear')
            .set('accept-encoding', 'gzip')
            .expect('content-encoding', 'gzip')
            .end(done);            
    });
   
    it('does not compress response when not asked', function (done) {
        request(server)
            .get('/api/bear')
            .set('accept-encoding', null)
            .expect(function (res) {
                res.header.should.not.have.property('content-encoding');
            })
            .end(done);            
    });

});
