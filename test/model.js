'use strict';

// import the moongoose helper utilities
var request = require('supertest');
var should = require('should');
var server = require('../lib/server');

describe('Data model', function () {
 
    it('should validate the model name', function (done) {
        request(server)
            .get('/api/unknown')
            .expect(400, { message: 'Unknown model name' }, done);
    });

    it('allows getting of the schema', function (done) {
        request(server)
            .get('/api/bear/schema')
            .expect(200, done);
    });
    
    it('should return 422, message and details when entity is invalid', function (done) {
        var bad = {
            name: [
                { tag: 'en', text: 'teddy bear'},
                { tag: 'zh-TW', text: '玩具熊' },
                { tag: 'zh-CH', string: '玩具熊' }
            ]
        };
        request(server)
            .post('/api/bear')
            .send(bad)
            .expect(422)
            .expect(function (res) {
                res.body.should.have.property('message');
                res.body.should.have.property('details');
            })
            .end(done);            
    });
    
    it('should not expose the tenant id', function (done) {
        request(server)
            .get('/api/bear')
            .expect(200)
            .expect(function (res) {
                res.text.should.not.match(/tenant/);
            })
            .end(done);
    });
    
});
