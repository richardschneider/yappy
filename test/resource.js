'use strict';

var request = require('supertest');
var should = require('should');
var server = require('../server');

describe('Resource', function () {
 
    it('should validate the resource name', function (done) {
        request(server)
            .get('/api/unknown')
            .expect(400, { message: 'Unknown resource name.' }, done);
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
