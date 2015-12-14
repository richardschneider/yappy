'use strict';

var request = require("./my-supertest");
var should = require('should');
var server = require('../lib/server');
var peers = require('../lib/pubsub');

describe('Error', () => {

    var err;
    var domainUrl;
    before(done => {
        request(server)
            .get('/api/bear/unknown')
            .set('Accept-Language', 'fr-FR')
            .expect(404)
            .expect(r => { err = r; })
        .then(() => {
        request(server)
            .post('/api/tenant')
            .send({
                name: [{tag: 'fr', text: 'moi'}],
                language: { fallback: 'fr', supported: ['fr-FR', 'fr'] },
                domain: 'fr-only'
            })
            .expect(201)
            .expect(res => {
                domainUrl = res.header['location'];
            })
            .end(done);
        })
        .catch(done);
    });

    after(done => {
        request(server)
            .delete(domainUrl)
            .set('host', 'fr-only.yappy.io')
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
        err.body.message.should.endWith('trouvée');
        done();
    });

    it('should only use the language(s) of the tenant', done => {
        request(server)
            .get('/api/bear/unknown')
            .set('host', 'fr-only.yappy.io')
            .expect(404)
            .expect(err => {
                err.headers.should.have.property('content-language', 'fr');
                err.body.message.should.endWith('trouvée');
            })
            .end(done);
    });

    it('should override accept-language with the lang query parameter', done => {
        request(server)
            .get('/api/bear/unknown?lang=fr')
            .set('Accept-Language', 'en')
            .expect(404)
            .expect(err => {
                err.headers.should.have.property('content-language', 'fr');
                err.body.message.should.endWith('trouvée');
            })
            .end(done);
    });

});

describe('500 Server Error', () => {
    before (done => {
        peers.subscribe('/yappy/error/*');
        done();
    });

    after (done => {
        peers.unsubscribe('/yappy/error/*');
        done();
    });

    it('should be published as /yappy/error/server', done => {
        peers.once('message', function onMessage(topic, msg) {
            topic.should.equal('/yappy/error/server');
            msg.should.have.property('message', 'bad');
            done();
        });
        request(server)
            .get('/api-test/error/bad')
            .expect(500)
            .end();
    });

});