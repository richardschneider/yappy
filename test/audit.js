'use strict';

var request = require("supertest-as-promised");
var should = require('should');
var server = require('../lib/server');

server.timeout = 10000;

describe('Audit Log', function () {

    it('should not allow POST', function (done) {
        request(server).post('/api/audit').send({}).expect(405).end(done);
    });
   
    it('should not allow PUT', function (done) {
        request(server).put('/api/audit/0').send({}).expect(405).end(done);
    });

    it('should not allow DELETE', function (done) {
        request(server).delete('/api/audit/0').send({}).expect(405).end(done);
    });

    it('should allow GET', function (done) {
        request(server).get('/api/audit').expect(200).end(done);
    });

    it('should allow GET schema', function (done) {
        request(server).get('/api/audit/schema').expect(200).end(done);
    });

    
});
