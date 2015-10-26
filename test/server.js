'use strict';

// import the moongoose helper utilities
var request = require('supertest');
var should = require('should');
var server = require('../server');

server.timeout = 10000;

describe('API server', function () {
 
    // before(function (done) {
    //     request(server)
    //         .get('/api/bear')
    //         .end(done);
    // });
    
    it('should return a hello message', function (done) {
        request(server)
            .get('/api')
            .expect(200, { message: 'Welcome to the e-commerce API!' }, done);
    });
    
    describe('GET list', function () {
        
        it('should return a list', function (done) {
            request(server)
                .get('/api/bear')
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });            
        });
       
    });

    describe('POST', function () {
        
        it('should return 201 with a Location header', function (done) {
            var bear = { name: 'test teddy' };
            request(server)
                .post('/api/bear')
                .send(bear)
                .expect(201)
                .expect('Location', /bear/)
                .end(done);            
        });
       
        it('should not return the newly created model', function (done) {
            var bear = { name: 'test teddy 2' };
            request(server)
                .post('/api/bear')
                .send(bear)
                .expect('Content-Length', 0)
                .end(done);            
        });

    });
	
});
