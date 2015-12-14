'use strict';

var request = require("./my-supertest");
var server = require('../lib/server');
var multi_tenancy = require('../lib/server/multi-tenancy');

describe('Multi-tenancy', function () {

    var test1Url;
    before(function (done) {
        request(server)
            .post('/api/tenant')
            .send({
                name: [{tag: 'en', text: 'me'}],
                domain: 'test-1'
            })
            .expect(201)
            .expect(res => { test1Url = res.header['location']; })
            .end(done);
    });

    after(function (done) {
        request(server)
            .delete(test1Url)
            .set('host', 'test-1.yappy.io')
            .expect(204)
            .end(done);
    });

    it('should return 400 Bad Request when tenant is unknown', function (done) {
        request(server)
            .get('/api/bear')
            .set('host', 'unknown.yappy.io')
            .expect(400, { message: 'Check the host name, especially unknown', details: '' }, done);
    });

    it('should allow access when tenant is known by host name', function (done) {
        request(server)
            .get('/api/bear')
            .set('host', 'test-1.yappy.io')
            .expect(200)
            .end(done);
    });

    it('should have unique tentant domain names', done => {
        request(server)
            .post('/api/tenant')
            .send({
                name: [{tag: 'en', text: 'me too'}],
                domain: 'test-1'
            })
            .expect(422)
            .end(done);
        });

    it('should only show the current tentant in a search', done => {
        request(server)
            .get('/api/tenant')
            .set('host', 'test-1.yappy.io')
            .expect(200)
            .expect(res => {
                res.body.data.should.be.instanceof(Array).and.have.lengthOf(1);
                res.body.data[0].domain.should.equal('test-1');
            })
            .end(done);
    });

    it('should allow access to the tenant', function (done) {
        request(server)
            .get(test1Url)
            .set('host', 'test-1.yappy.io')
            .expect(200)
            .end(done);
    });

    it('should allow access to all services', function (done) {
        request(server)
            .get(test1Url)
            .set('host', 'test-1.yappy.io')
            .expect(200)
            .expect(res => {
                res.body.should.have.property('service');
            })
            .end(done);
    });

    it('should make services specific to a tenant', done => {
        let req = { headers: {} },
            res = { mung: () => null };
        req.headers.host = '127.0.0.1';
        multi_tenancy(req, res, () => {
            req.should.have.property('services');
            req.services.should.have.property('translation');
            done();
        });
    });

    it('should remove the tenentId from resources', function (done) {
        request(server)
            .get('/api/bear')
            .expect(200)
            .expect(res => {
                res.body.data.length.should.be.above(0);
                for (let r of res.body.data) {
                    r.should.not.have.property('tenantId');
                }
            })
            .end(done);
    });

});
