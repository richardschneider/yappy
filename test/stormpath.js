'use strict';

var request = require("supertest-as-promised");
var should = require('should');
var server = require('../lib/server');
var peers = require('../lib/pubsub');

describe('Stormpath', () => {

    it('should list users', done => {
        request(server)
            .get('/api/user')
            .expect(200)
            .expect(res => {
                res.body.should.have.property('data');
            })
            .end(done);
    });

    it('should list roles', done => {
        request(server)
            .get('/api/role')
            .expect(200)
            .expect(res => {
                res.body.should.have.property('data');
            })
            .end(done);
    });

});
