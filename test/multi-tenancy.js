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
            .expect(204)
            .end(done);
    });

    it('should return 400 Bad Request when tenant is unknown', function (done) {
        request(server)
            .get('/api/bear')
            .set('host', 'unknown.ecom.io')
            .expect(400, { message: 'Check the host name, especially unknown' }, done);
    });
    
    it('should allow access when tenant is known', function (done) {
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
            .expect(res => { 
                res.status.should.not.equal(201); 
            })
            .end(done);
        });
    
});
