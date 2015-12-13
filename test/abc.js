'use strict';

require('should');
let request = require("supertest-as-promised"),
    server = require('../lib/server');

describe('ABC authentication', function () {

    it('should allow anonymous access', function (done) {
        request(server)
            .get('/api/whoami')
            .expect(200)
            .expect(res => {
                res.body.email.should.startWith('anonymous');
            })
            .end(done);
    });

    it('should allow Basic auth', function (done) {
        request(server)
            .get('/api/whoami')
            .auth('alice', 'xyzzy')
            .expect(200)
            .expect(res => {
                res.body.email.should.equal('alice@abc.org');
            })
            .end(done);
    });

});
