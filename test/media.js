'use strict';

var request = require("supertest-as-promised");
var should = require('should');
var server = require('../server');
var medialink = require('../server/model/medialink');

server.timeout = 10000;

describe('Media upload', function () {

    var uploadResponse;
    
    before(function (done) {
        request(server)
            .post('/api/media')
            .attach('media', new Buffer('<b>Hello world</b>'), 'hello.html')
            .expect(function (res) {
                uploadResponse = res;
            })
            .end(done);
    });
    
    it('should return 201 on success', function (done) {
        uploadResponse.status.should.equal(201);
        done();
    });
    
    it('should return Last-Modified header', function (done) {
        uploadResponse.header['last-modified'].should.match(/GMT/);
        done();
    });

    it('should return a valid media link in Location header', function (done) {
        uploadResponse.header['location'].should.match(medialink);
        done();
    });
   

});
