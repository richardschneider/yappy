'use strict';

require('should');
let redact = require('../lib/server/redact'),
    authorisation = require('../lib/server/authorisation'),
    request = require("supertest-as-promised"),
    server = require('../lib/server');

let closetTeddy = {
    name: [ { tag: 'en', text: 'teddy bear with a secret' }],
    '!secret': 'hates honey'
};

describe ('Redact', () => {

    let req = {
            method: 'PUT',
            user: {
                email: 'valhalla@wellington.co.nz',
                permissions: []
            }
        },
        res = {};

    let closetResponse;
    before(done => {
        authorisation(req, res);
        request(server)
            .post('/api/bear')
            .set('prefer', 'return=representation')
            .send(closetTeddy)
            .expect(201)
            .expect(function (res) {
                closetResponse = res;
            })
            .end(done);
    });

    it('should not show the plain text API key when viewing the tenant', () => {
        let plain = {
            services: [
                { name: 'a', '!apikey': 'a'},
                { name: 'b' },
                { name: 'c', '!apikey': 'c'}
            ]
        };
        let redacted = redact.document(plain, req, res);
        redacted.services[0]['!apikey'].should.not.equal('a');
        redacted.services[2]['!apikey'].should.not.equal('c');
    });

    it('should add metadata about the change', () => {
        let plain = {
            services: [
                { name: 'a', '!apikey': 'a'},
                { name: 'b' },
                { name: 'c', '!apikey': 'c'}
            ]
        };
        let redacted = redact.document(plain, req, res);
        redacted.should.have.property(redact.metadataName);
    });


    it('should not add metadata when no changes are made', () => {
        let plain_noapikey = {
            services: [
                { name: 'a', noapikey: 'a'},
                { name: 'b' },
                { name: 'c', noapikey: 'c'}
            ]
        };
        let redacted = redact.document(plain_noapikey, req, res);
        redacted.should.not.have.property(redact.metadataName);
    });

    it('should not allow update of redacted document', () => {
        let plain = {
            services: [
                { name: 'a', '!apikey': 'a'},
                { name: 'b' },
                { name: 'c', '!apikey': 'c'}
            ]
        };
        let redacted = redact.document(plain, req, res);
        redact.allowUpdate(redacted, req, res).should.equal(false);
    });

    it('should allow patching of redacted document', () => {
        let plain = {
            services: [
                { name: 'a', '!apikey': 'a'},
                { name: 'b' },
                { name: 'c', '!apikey': 'c'}
            ]
        };
        let redacted = redact.document(plain, req, res);
        redact.allowUpdate(redacted, { method: 'PATCH' }, res).should.equal(true);
    });

    it('should allow update of non-redacted document', () => {
        let plain_noapikey = {
            services: [
                { name: 'a', noapikey: 'a'},
                { name: 'b' },
                { name: 'c', noapikey: 'c'}
            ]
        };
        let redacted = redact.document(plain_noapikey, req, res);
        redact.allowUpdate(redacted, req, res).should.equal(true);
    });

    it('should not show sensitive and secret information', () => {
        let plain = {
            standard: 'foo',
            '~dob': 'my dob',
            '!credit_card': '12-1333-558858-09'
        };
        let redacted = redact.document(plain, req, res);
        redacted.should.have.property('standard', 'foo');
        redacted.should.have.property('~dob', redact.mask);
        redacted.should.have.property('!credit_card', redact.mask);
    });

    it('should hide a secret', done => {
        closetResponse.body['!secret'].should.equal(redact.mask);
        done();
    });

    it('should allow retrieval of a secret', done => {
        let exposeUrl = closetResponse.body._metadata.redactions['/!secret'];
        request(server)
            .get(exposeUrl)
            .expect(200)
            .expect(function (res) {
                res.text.should.equal(closetTeddy['!secret']);
            })
            .end(done);
    });


});
