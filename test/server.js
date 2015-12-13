'use strict';

var request = require("./my-supertest");
var server = require('../lib/server');

describe('API server', function () {

    it('should return a hello message', done => {
        request(server)
            .get('/api')
            .expect(200)
            .expect(res => res.body.message.should.equal('Welcome to the e-commerce API!'))
            .end(done);
    });
    
});
