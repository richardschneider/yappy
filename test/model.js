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

    it('allows getting of the schema', function (done) {
        request(server)
            .get('/api/bear/schema')
            .expect(200, done);
    });
    
    it('returns 422 when entity is invalid', function (done) {
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
            .end(done);            
    });
    
});
