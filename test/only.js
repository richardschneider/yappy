'use strict';

require('should');
let request = require("supertest-as-promised"),
    server = require('../lib/server');

describe('?only', function () {

    let tenant, tenantUrl;
    before(done => {
        request(server)
            .get('/api/tenant')
            .expect(200)
            .expect(res => {
                tenantUrl = res.body.data[0]._metadata.self;
                tenant = res.body.data[0];
            })
            .end(done);
    });

    it('should work with a read', done => {
        request(server)
            .get(tenantUrl + '?only=/domain')
            .expect(200)
            .expect(res => {
                res.text.should.equal(tenant.domain);
            })
            .end(done);
    });

    it('should set content-type: text/plain when returning a scalar', done => {
        request(server)
            .get(tenantUrl + '?only=/domain')
            .expect(200)
            .expect(res => {
                res.header['content-type'].should.startWith('text/plain');
                res.text.should.equal(tenant.domain);
            })
            .end(done);
    });

    it('should set content-type: application/json when returning an object', done => {
        request(server)
            .get(tenantUrl + '?only=/service/yandex')
            .expect(200)
            .expect(res => {
                res.header['content-type'].should.startWith('application/json');
                res.body.should.eql(tenant.service.yandex);
            })
            .end(done);
    });

    it('should set content-type: application/json when returning an array', done => {
        request(server)
            .get(tenantUrl + '?only=/forex/currencies')
            .expect(200)
            .expect(res => {
                res.header['content-type'].should.startWith('application/json');
                res.body.should.eql(tenant.forex.currencies);
            })
            .end(done);
    });

    it('should return an object, keyed by the pointer, with multiple only values', done => {
        request(server)
            .get(tenantUrl + '?only=/forex/base&only=/language/fallback')
            .expect(200)
            .expect(res => {
                res.body.data[0].should.have.property('/forex/base', tenant.forex.base);
                res.body.data[0].should.have.property('/language/fallback', tenant.language.fallback);
            })
            .end(done);
    });

    it('should work with a search', done => {
        request(server)
            .get('/api/tenant?only=/domain')
            .expect(200)
            .expect(res => {
                res.body.should.have.property('links');
                res.body.data[0].should.have.property('/domain', tenant.domain);
            })
            .end(done);
    });

    it('should return an object, keyed by the pointer, with multiple resources', done => {
        request(server)
            .get('/api/tenant?only=/domain')
            .expect(200)
            .expect(res => {
                res.body.data[0].should.have.property('/domain', tenant.domain);
            })
            .end(done);
    });

    it('should indicate in _metadata that the information is a subset (partial) of the resource', done => {
        request(server)
            .get('/api/tenant?only=/domain')
            .expect(200)
            .expect(res => {
                res.body.data[0]._metadata.should.have.property('partial', true);
            })
            .end(done);
    });

    it('should return 204 No Content when the pointer has no value', done => {
          request(server)
            .get(tenantUrl + '?only=/damain') // typo on purpose
            .expect(204)
            .end(done);
    });

})