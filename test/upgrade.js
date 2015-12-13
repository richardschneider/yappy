'use strict';

var request = require("./my-supertest");
var should = require('should');
var server = require('../lib/server');


describe('Upgrade', function () {

    it('should always have a history', function (done) {
        request(server)
            .get('/api/config/upgrade')
            .expect(200)
            .end(done);            
    });
   

});
