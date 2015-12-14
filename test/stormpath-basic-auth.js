'use strict';

require('should');
let request = require("./my-supertest"),
    server = require('../lib/server');

describe('Stormpath Basic authentication', function () {

    let tenant;
    let service_on = [ { "op": "replace", "path": "/service/stormpath-basic-auth/enabled", "value": true } ];
    let service_off = [ { "op": "replace", "path": "/service/stormpath-basic-auth/enabled", "value": false } ];

    // enable the service
    before(done => {
        request(server)
            .get('/api/tenant')
            .expect(200)
            .then(res => {
                tenant = res.body.data[0]._metadata.self;
                return request(server)
                    .patch(tenant)
                    .set('content-type', 'application/json-patch+json')
                    .send(JSON.stringify(service_on))
                    .expect(204)
                    .then(() => done())
                    .catch(done);
            });
    });

    after(done => {
        return request(server)
            .patch(tenant)
            .set('content-type', 'application/json-patch+json')
            .send(JSON.stringify(service_off))
            .expect(204)
            .then(() => done())
            .catch(done);
    });

    it('should be a published service', done => {
        request(server)
            .get('/api/tenant')
            .expect(200)
            .expect(res => {
                let tenant = res.body.data[0];
                tenant.service.should.have.property('stormpath-basic-auth');
            })
            .end(done);
    });

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
