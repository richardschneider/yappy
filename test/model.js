'use strict';

// import the moongoose helper utilities
var request = require('./my-supertest');
var should = require('should');
var server = require('../lib/server');

describe('Data model', function () {

    it('should validate the model name', function (done) {
        request(server)
            .get('/api/unknown')
            .expect(400)
            .expect(res => res.body.should.have.property('message', "Resource type 'unknown' is unknown"))
            .end(done);
    });

    it('should have a schema', function (done) {
        request(server)
            .get('/api/bear/schema')
            .expect(200, done);
    });

    it('should have a schema of type application/schema+json', function (done) {
        request(server)
            .get('/api/bear/schema')
            .expect(200)
            .expect(res => res.get('content-type').should.startWith('application/schema+json'))
            .end(done);
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
