'use strict';

var request = require("supertest-as-promised");
var server = require('../lib/server');

describe('API server', function () {

    it('should return a hello message', function (done) {
        request(server)
            .get('/api')
            .expect(200, { message: 'Welcome to the e-commerce API!' }, done);
    });
    
});
