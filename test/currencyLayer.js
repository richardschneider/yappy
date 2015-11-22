'use strict';

var should = require('should');
var request = require("supertest-as-promised");
var server = require('../lib/server');
var iso = require('../lib/model/iso')
var fx = require('../lib/service/currencyLayer');

describe ('Currency Layer forex rates', () => {

    it('should be a published service', done => {
        request(server)
            .get('/api/tenant')
            .expect(200)
            .expect(res => {
                let tenant = res.body[0];
                should.exist(tenant.service.currencyLayer);
            })
            .end(done);
    });
    
    it('should return USD-NZD exchange rate', done => {
        fx('USD', undefined, fx.details.options)
            .then(rates => {
                rates.should.have.property('base', 'USD');
                rates.should.have.property('date')
                    .and.match(iso.dateTime);
                rates.should.have.property('rates')
                    .and.have.property('NZD');
                done();
            })
        .catch(done);
    });

});
