'use strict';

var request = require("supertest-as-promised");
var should = require('should');
var server = require('../lib/server');

describe('Error', () => {

    var err;
    before(done => {
        request(server)
        .get('/api/unknown')
        .set('Accept-Language', 'fr')
        .expect(400)
        .expect(r => err = r)
        .end(done);
    }); 

    it('should have a message', done => {
        err.body.should.have.property('message');
        done();
    });
   
    it('should have Content-Language', done => {
        err.headers.should.have.property('content-language');
        done();
    });

    it('should be translated', done => {
        err.headers.should.have.property('content-language', 'fr');
        err.body.message.should.equal('Inconnu nom de modèle');
        done();
    });

});