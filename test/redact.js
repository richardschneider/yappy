'use strict';

require('should');
let redact = require('../lib/server/redact'),
    authorisation = require('../lib/server/authorisation');

describe ('Redact', () => {

    let req = {
            method: 'PUT',
            user: {
                email: 'valhalla@wellington.co.nz',
                permissions: []
            }
        },
        res = {};

    before(() => {
        authorisation(req, res);
    });

    it('should not show the plain text API key when viewing the tenant', () => {
        let plain = {
            services: [
                { name: 'a', apikey: 'a'},
                { name: 'b' },
                { name: 'c', apikey: 'c'}
            ]
        };
        let redacted = redact.document(plain, req, res);
        redacted.services[0].apikey.should.not.equal('a');
        redacted.services[2].apikey.should.not.equal('c');
    });

    it('should add metadata about the change', () => {
        let plain = {
            services: [
                { name: 'a', apikey: 'a'},
                { name: 'b' },
                { name: 'c', apikey: 'c'}
            ]
        };
        let redacted = redact.document(plain, req, res);
        redacted.should.have.property(redact.metadataName);
    });

    it('should work with the results of a search', () => {
        let searchResults = {
            links: { },
            data: [
                { name: 'a', apikey: 'a'},
                { name: 'b' },
                { name: 'c', apikey: 'c'}
            ]
        };
        let redacted = redact.document(searchResults, req, res);
        redacted.data[0].apikey.should.equal(redact.mask);
        redacted.data[2].apikey.should.equal(redact.mask);
        redacted.data[0].should.have.property(redact.metadataName);
        redacted.data[1].should.not.have.property(redact.metadataName);
        redacted.data[2].should.have.property(redact.metadataName);
        redacted.should.not.have.property(redact.metadataName);
    });

    it('should work with array of documents', () => {
        let plain = {
            services: [
                { name: 'a', apikey: 'a'},
                { name: 'b' },
                { name: 'c', apikey: 'c'}
            ]
        };
        let plain_noapikey = {
            services: [
                { name: 'a', noapikey: 'a'},
                { name: 'b' },
                { name: 'c', noapikey: 'c'}
            ]
        };
        let plain_array = [plain, plain, plain_noapikey];
        let redacted = redact.document(plain_array, req, res);
        redacted[0].services[0].apikey.should.equal(redact.mask);
        redacted[0].services[2].apikey.should.equal(redact.mask);
        redacted[1].services[0].apikey.should.equal(redact.mask);
        redacted[1].services[2].apikey.should.equal(redact.mask);
        redacted[0].should.have.property(redact.metadataName);
        redacted[1].should.have.property(redact.metadataName);
        redacted[2].should.not.have.property(redact.metadataName);
        redacted.should.not.have.property(redact.metadataName);
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
                { name: 'a', apikey: 'a'},
                { name: 'b' },
                { name: 'c', apikey: 'c'}
            ]
        };
        let redacted = redact.document(plain, req, res);
        redact.allowUpdate(redacted, req, res).should.equal(false);
    });

    it('should allow patching of redacted document', () => {
        let plain = {
            services: [
                { name: 'a', apikey: 'a'},
                { name: 'b' },
                { name: 'c', apikey: 'c'}
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

    it('should remove restricted resources', () => {
        let searchResults = {
            links: { },
            data: [
                { name: 'a', apikey: 'a', _metadata: { type: 'x', self: '/api/x/1' }},
                { name: 'b', _metadata: { type: 'x', self: '/api/x/2' } },
                { name: 'c', apikey: 'c', _metadata: { type: 'x', self: '/api/x/3' }}
            ]
        };
        req.user.permissions.push('api:x:view:1');
        req.user.permissions.push('api:x:view:3');
        let redacted = redact.removeRestrictedResources(searchResults, req, res);
        let data = redacted.data.filter(e => e); // remove undefined elements
        data.should.have.lengthOf(2);
    });

});
