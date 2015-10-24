'use strict';

// import the moongoose helper utilities
var request = require('supertest');
var should = require('should');
var server = require('../server');

describe('API server', function () {
 
    it('should return a hello message', function (done) {
        request(server)
            .get('/api')
            .expect(200, { message: 'Welcome to the e-commerce API!' }, done);
    });
	
});
