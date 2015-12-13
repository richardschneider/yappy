'use strict';

require('should');
let request = require("./my-supertest"),
    server = require('../lib/server');

describe('Stormpath Basic authentication', function () {

    it('should allow Basic auth', function (done) {
        request(server)
            .get('/api/whoami')
            .auth('storm', '1Password!')
            .expect(200)
            .expect(res => {
                res.body.email.should.equal('foo.bar@erehwon.org');
            })
            .end(done);
    });

    it('should 401 bad username/password', function (done) {
        request(server)
            .get('/api/whoami')
            .auth('no-one', 'here')
            .expect(401)
            .expect(res => {
                res.body.should.have.property('details');
                res.body.details.should.have.property('stormpath-basic-auth');
            })
            .end(done);
    });


});
