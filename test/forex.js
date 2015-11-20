'use strict';

var should = require('should');
var request = require("supertest-as-promised");
var server = require('../lib/server');
var iso = require('../lib/model/iso');

describe ('Forex', () => {

    var tenant;
    before(done => {
        request(server)
            .get('/api/tenant')
            .expect(200)
            .expect(res => {
                tenant = res.body[0];
            })
            .end(done);
    });
    
    it('should default the base currency', done => {
        request(server)
            .get('/forex')
            .expect(200)
            .expect(res => {
                let rates = res.body;
                rates.should.have.property('base');
                rates.should.have.property('date')
                    .and.match(iso.dateTime);
                rates.should.have.property('rates')
                    .and.have.property('NZD');
            })
            .end(done);
    });

    it('should only return currencies of interest', done => {
        request(server)
            .get('/forex')
            .expect(200)
            .expect(res => {
                let rates = res.body.rates;
                Object.keys(rates).length.should.equal(tenant.forex.currencies.length);
            })
            .end(done);
    });

    it('should return CNY exchange rates', done => {
        request(server)
            .get('/forex/CNY')
            .expect(200)
            .expect(res => {
                let rates = res.body;
                rates.should.have.property('base', 'CNY');
                rates.should.have.property('date')
                    .and.match(iso.dateTime);
                rates.should.have.property('rates')
                    .and.have.property('NZD');
            })
            .end(done);
    });

    it('should return error on valid but unknown currency', done => {
        request(server)
            .get('/forex/AAA')
            .expect(res => {
                res.status.should.be.above(399);
            })
            .end(done);
    });

    it('should return error on invalid currency', done => {
        request(server)
            .get('/forex/invalid-currency')
            .expect(400)
            .end(done);
    });
    
});
