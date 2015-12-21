'use strict';

require('should');
let request = require("./my-supertest"),
    server = require('../lib/server');

let cave = {
    name: [
        { tag: 'en', text: 'valhalla'}
    ],
    location: {
        type: 'Point',
        coordinates: [174.7730953, -41.2948713]
    }
};
let teddy = {
    name: [
        { tag: 'en', text: 'teddy bear'},
        { tag: 'zh-TW', text: '玩具熊' },
        { tag: 'zh-CH', text: '玩具熊' }
    ],
    likes: ['honey', 'mead']
};

describe('Stormpath Basic authentication', function () {

    let tenant;
    let service_on =  [ { "op": "replace", "path": "/service/stormpath-basic-auth/enabled", "value": true } ];
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

    it('should be trusted for authorisation', function (done) {
        request(server)
            .get('/api/tenant')
            .expect(200)
            .expect(res => {
                let tenant = res.body.data[0];
                tenant.service['stormpath-basic-auth'].options.should.have.property('trusted_for_authorization', true);
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

    it('should allow Storm to create a cave', done => {
        request(server)
            .post('/api/cave')
            .auth('storm', '1Password!')
            .send(cave)
            .expect(201)
            .then(res => {
                let url = res.header['location'];
                request(server).delete(url).end(done);
            })
            .catch(done);
    });

    it('should not allow Storm to create a bear', done => {
        request(server)
            .post('/api/bear')
            .auth('storm', '1Password!')
            .send(teddy)
            .expect(403)
            .end(done);
    });

    it('should set user roles', function (done) {
        request(server)
            .get('/api/whoami')
            .auth('storm', '1Password!')
            .expect(200)
            .expect(res => {
                res.body.should.have.property('roles')
                    .and.be.instanceOf(Array);
            })
            .end(done);
    });


});
