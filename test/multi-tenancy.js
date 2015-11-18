'use strict';

var request = require("supertest-as-promised");
var server = require('../lib/server');

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
            .set('host', 'test-1.ecom.io')
            .expect(204)
            .end(done);
    });

    it('should return 400 Bad Request when tenant is unknown', function (done) {
        request(server)
            .get('/api/bear')
            .set('host', 'unknown.ecom.io')
            .expect(400, { message: 'Check the host name, especially unknown' }, done);
    });
    
    it('should allow access when tenant is known by host name', function (done) {
        request(server)
            .get('/api/bear')
            .set('host', 'test-1.ecom.io')
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
            .set('host', 'test-1.ecom.io')
            .expect(200)
            .expect(res => {
                res.body.should.be.instanceof(Array).and.have.lengthOf(1);
                res.body[0].domain.should.equal('test-1');
            })
            .end(done);
    });
    
    it('should allow access to the tenant', function (done) {
        request(server)
            .get(test1Url)
            .set('host', 'test-1.ecom.io')
            .expect(200)
            .end(done);
    });

    it('should allow the access to all services', function (done) {
        request(server)
            .get(test1Url)
            .set('host', 'test-1.ecom.io')
            .expect(200)
            .expect(res => {
                console.log(res.body);
                res.body.should.have.property('services');
            })
            .end(done);
    });
    
});
