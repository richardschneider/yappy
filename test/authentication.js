'use strict';

require('should');
let authn = require("../lib/server/authentication"),
    request = require("./my-supertest"),
    server = require('../lib/server');

describe('Authentication', function () {

    it('should 401 when user is unknown', done => {
        request(server)
            .get('/api/bear')
            .auth('unknown-user', 'xyzzy')
            .expect(401)
            .end(done);
    });

    it('should 401 when password is unknown', done => {
        request(server)
            .get('/api/bear')
            .auth('alice', 'not-xyzzy')
            .expect(401)
            .end(done);
    });

    it('should pass when user and password are good', done => {
        request(server)
            .get('/api/bear')
            .auth('alice', 'xyzzy')
            .expect(200)
            .end(done);
    });

});
