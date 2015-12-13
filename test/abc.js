'use strict';

require('should');
let request = require("./my-supertest"),
    server = require('../lib/server');

describe('ABC authentication', function () {

    it('should allow anonymous access', function (done) {
        request(server)
            .get('/api/whoami')
            .set('Authorization', 'None x')
            .expect(200)
            .expect(res => {
                res.body.email.should.startWith('anonymous');
            })
            .end(done);
    });

    it('should allow Basic auth', function (done) {
        request(server)
            .get('/api/whoami')
            .auth('bob', 'xyzzy')
            .expect(200)
            .expect(res => {
                res.body.email.should.equal('bob@abc.org');
            })
            .end(done);
    });

});
