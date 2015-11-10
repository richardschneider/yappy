'use strict';

var request = require("supertest-as-promised");
var should = require('should');
var server = require('../lib/server');

server.timeout = 10000;

describe('Audit Log', function () {

    it('cannot POST', function (done) {
        request(server).post('/api/audit').send({}).expect(405).end(done);
    });
   
    it('cannot PUT', function (done) {
        request(server).put('/api/audit/0').send({}).expect(405).end(done);
    });

    it('cannot DELETE', function (done) {
        request(server).delete('/api/audit/0').send({}).expect(405).end(done);
    });

    it('is readable', function (done) {
        request(server).get('/api/audit').expect(200).end(done);
    });

});
