'use strict';

require('should');
let request = require("./my-supertest"),
    server = require('../lib/server');

let teddy = {
    name: [
        { tag: 'en', text: 'teddy bear'},
        { tag: 'zh-TW', text: '玩具熊' },
        { tag: 'zh-CH', text: '玩具熊' }
    ],
    likes: ['honey', 'mead']
};

describe('ABC authentication', function () {

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

    it('should be trusted for authorisation', function (done) {
        request(server)
            .get('/api/tenant')
            .expect(200)
            .expect(res => {
                let tenant = res.body.data[0];
                tenant.service.abc.options.should.have.property('trusted_for_authorization', true);
            })
            .end(done);
    });

    it('should return user details', function (done) {
        request(server)
            .get('/api/whoami')
            .auth('alice', 'xyzzy')
            .expect(200)
            .expect(res => {
                res.body.homepage.should.equal('https://www.youtube.com/watch?v=aEj-mrwwaxo');
            })
            .end(done);
    });

    it('should allow Bob to create', done => {
        request(server)
            .post('/api/bear')
            .auth('bob', 'xyzzy')
            .send(teddy)
            .expect(201)
            .then(res => {
                let url = res.header['location'];
                request(server).delete(url).end(done);
            })
    });

    it('should not allow Carol to create', done => {
        request(server)
            .post('/api/bear')
            .auth('carol', 'xyzzy')
            .send(teddy)
            .expect(403)
            .end(done);

    });
});
