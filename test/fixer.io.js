'use strict';

var should = require('should');
var request = require("supertest-as-promised");
var server = require('../lib/server');
var iso = require('../lib/model/iso')
var fx = require('../lib/service/fixer.io');

describe ('Fixer.io forex rates', () => {

    it('should be a published service', done => {
        request(server)
            .get('/api/tenant')
            .expect(200)
            .expect(res => {
                let tenant = res.body[0];
                let fixer = tenant.services.find(e => e.moduleName == 'fixer.io');
                should.exist(fixer);
            })
            .end(done);
    });
    
    it('should return NZD exchange rates', done => {
        fx('NZD', fx.details.options)
            .then(rates => {
                rates.should.have.property('base', 'NZD');
                rates.should.have.property('date')
                    .and.match(iso.date);
                rates.should.have.property('rates')
                    .and.have.property('AUD');
                done();
            })
    });

});
