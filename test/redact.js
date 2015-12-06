'use strict';

require('should');
let redact = require('../lib/server/redact'),
    mung = require('../lib/server/mung'),
    authorisation = require('../lib/server/authorisation'),
    request = require("supertest-as-promised"),
    server = require('../lib/server');

let closetTeddy = {
    name: [ { tag: 'en', text: 'teddy bear with a secret' }],
    '!secret': 'hates honey'
};

describe ('Redact', () => {

    let statusCode;
    let req = {
            method: 'PUT',
            user: {
                email: 'valhalla@wellington.co.nz',
                permissions: []
            }
        },
        res = {
            status: status => { statusCode = status; },
            mung: () => res,
            send: () => res,
            end: () => res,
            sendError: (status, msg) => { statusCode = status; }
        },
        next = () => null;

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
        redacted[redact.metadataName].should.have.property('redactions');
    });


    it('should not add metadata.redactions when no changes are made', () => {
        let plain_noapikey = {
            services: [
                { name: 'a', noapikey: 'a'},
                { name: 'b' },
                { name: 'c', noapikey: 'c'}
            ]
        };
        let redacted = redact.document(plain_noapikey, req, res);
        redacted[redact.metadataName].should.not.have.property('redactions');
    });

    it('should allow update of a non-redacted document', () => {
        let plain = {
            services: [
                { name: 'a', '!apikey': 'a'},
                { name: 'b' },
                { name: 'c', '!apikey': 'c'}
            ]
        };
        statusCode = 200;
        req.method = 'PUT';
        req.body = plain;
        req.text = null;
        mung(req, res, next);
        redact(req, res, next);
        statusCode.should.equal(200);
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
        statusCode = 200;
        req.method = 'PUT';
        req.body = redacted;
        req.text = null;
        mung(req, res, next);
        redact(req, res, next);
        statusCode.should.equal(422);
    });

    it('should encrypt classified fields on document POST', () => {
        let plain = {
            services: [
                { name: 'a', '!apikey': 'a'},
                { name: 'b' },
                { name: 'c', '!apikey': 'c'}
            ]
        };
        statusCode = 200;
        req.method = 'POST';
        req.body = plain;
        req.text = null;
        mung(req, res, next);
        redact(req, res, next);
        statusCode.should.equal(200);
        plain.services[0]['!apikey'].should.not.equal('a');
        plain.services[2]['!apikey'].should.not.equal('c');
    });

    it('should encrypt classified fields on document PUT', () => {
        let plain = {
            services: [
                { name: 'a', '!apikey': 'a'},
                { name: 'b' },
                { name: 'c', '!apikey': 'c'}
            ]
        };
        statusCode = 200;
        req.method = 'PUT';
        req.body = plain;
        req.text = null;
        mung(req, res, next);
        redact(req, res, next);
        statusCode.should.equal(200);
        plain.services[0]['!apikey'].should.not.equal('a');
        plain.services[2]['!apikey'].should.not.equal('c');
    });

    it('should encrypt classified fields on document PATCH', () => {
        let patch = [
            { op: 'replace', path: '/services/0/!apikey', value: 'xyzzy' },
            { op: 'replace', path: '/services/0/name', value: '!name' },
        ];
        statusCode = 200;
        req.method = 'PATCH';
        req.body = patch;
        req.text = null;
        mung(req, res, next);
        redact(req, res, next);
        statusCode.should.equal(200);
        patch[0].value.should.not.equal('xyzzy');
        patch[1].value.should.equal('!name');
    });

    it('should not show classified information', () => {
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
