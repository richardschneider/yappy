'use strict';

var should = require('should');
var request = require("supertest-as-promised");
var server = require('../lib/server');

describe ('Yandex translator', () => {

    it('should be a published service', done => {
        request(server)
            .get('/api/tenant')
            .expect(200)
            .expect(res => {
                let tenant = res.body[0];
                let yandex = tenant.services.find(e => e.moduleName == 'yandex');
                should.exist(yandex);
            })
            .end(done);
    });
    

});