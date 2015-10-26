'use strict';

// import the moongoose helper utilities
var request = require('supertest');
var should = require('should');
var server = require('../server');

describe('Data model', function () {
 
    it('should validate the model name', function (done) {
        request(server)
            .get('/api/unknown')
            .expect(400, { message: 'Unknown model name.' }, done);
    });
	
});
