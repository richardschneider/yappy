'use strict';

var request = require("supertest-as-promised");
var should = require('should');
var server = require('../lib/server');

describe('Error', () => {

    var err;
    var domainUrl;
    before(done => {
        request(server)
            .get('/api/bear/unknown')
            .set('Accept-Language', 'fr')
            .expect(404)
            .expect(r => { err = r; })
        .then(() => {
        request(server)
            .post('/api/tenant')
            .send({
                name: [{tag: 'en', text: 'moi'}],
                languages: ['fr'],
                domain: 'fr-only'
            })
            .expect(201)
            .expect(res => { 
                domainUrl = res.header['location']; 
                console.log(domainUrl)
            })
            .end(done);
        });
    }); 
    
    after(done => {
        request(server)
            .delete(domainUrl)
            .set('host', 'fr-only.ecom.io')
            .expect(204)
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

    it('should be translated per Accept-Language', done => {
        err.headers.should.have.property('content-language', 'fr');
        err.body.message.should.endWith('trouvé');
        done();
    });
    
    it('should only use the language(s) of the tentant', done => {
        request(server)
            .get('/api/bear/unknown')
            .set('host', 'fr-only.ecom.io')
            .expect(404)
            .expect(err => {
                err.headers.should.have.property('content-language', 'fr');
                err.body.message.should.endWith('trouvé');
            })
            .end(done);
    });


});