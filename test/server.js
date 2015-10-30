'use strict';

// import the moongoose helper utilities
//var request = require('supertest');
var request = require("supertest-as-promised");
var should = require('should');
var server = require('../server');

server.timeout = 10000;

var teddy = {
    name: [
        { tag: 'en', text: 'teddy bear'},
        { tag: 'zh-TW', text: '玩具熊' },
        { tag: 'zh-CH', text: '玩具熊' }
    ]
};

describe('API server', function () {

    var postres;
    var teddyUrl;
    before(function (done) {
        request(server)
            .post('/api/bear')
            .send(teddy)
            .expect(201)
            .expect(function (res) {
                postres = res;
                teddyUrl = res.header['location'];
            })
            .end(done);            
    });
    
    it('should return a hello message', function (done) {
        request(server)
            .get('/api')
            .expect(200, { message: 'Welcome to the e-commerce API!' }, done);
    });
    
    describe('GET', function () {

        it('returns Last-Modified header', function (done) {
            request(server)
                .get(teddyUrl)
                .expect('Last-Modified', /GMT/)
                .end(done);
        });

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
        
        it('should return 201 with a Location header relative to the server', function (done) {
            postres.header['location'].should.match(/^\/api\/bear/);
            done();
        });
       
        it('should return a body with status and refers to the new resource', function (done) {
            postres.body.status.should.equal('ok');
            postres.body.self.should.equal(teddyUrl);
            done();
        });
        
        it('should set modifiedOn', function (done) {
            request(server)
                .get(teddyUrl)
                .expect(200)
                .expect(function (res) {
                    res.body.should.have.property('modifiedOn');
                })
                .end(done);
        });

        it('returns Last-Modified header', function (done) {
            postres.header['last-modified'].should.match(/GMT/);
            done();
        });

        it('returns 422 when entity is empty', function (done) {
            request(server)
                .post('/api/bear')
                .send({})
                .expect(422)
                .end(done);
        });
        
    });
	
});
