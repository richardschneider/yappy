'use strict';

var should = require('should');
var request = require("supertest-as-promised");
var server = require('../lib/server');
var iso = require('../lib/model/iso');
var fx = require('../lib/service/fixerIO');

describe ('Fixer.io forex rates', () => {

    it('should be a published service', done => {
        request(server)
            .get('/api/tenant')
            .expect(200)
            .expect(res => {
                let tenant = res.body.data[0];
                should.exist(tenant.service.fixerIO);
            })
            .end(done);
    });
    
    it('should return NZD exchange rates', done => {
        fx('NZD', undefined, fx.details.options)
            .then(rates => {
                rates.should.have.property('base', 'NZD');
                rates.should.have.property('date')
                    .and.match(iso.dateTime);
                rates.should.have.property('rates')
                    .and.have.property('AUD');
                done();
            })
            .catch(done);
    });

    it('should only return currencies of interest', done => {
        fx('NZD', ['AUD', 'CNY'], fx.details.options)
            .then(rates => {
                rates.should.have.property('base', 'NZD');
                rates.should.have.property('rates');
                Object.keys(rates.rates).should.have.lengthOf(2);
                rates.rates.should.have.property('AUD');
                rates.rates.should.have.property('CNY');
                done();
            })
            .catch(done);
    });

    
});
