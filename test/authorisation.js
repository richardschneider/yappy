'use strict';

require('should');
let authz = require("../lib/server/authorisation"),
    request = require("./my-supertest"),
    server = require('../lib/server');

describe('Authorisation', function () {

    it('should allow read-only users to resources', () => {
        let req = {user: { permissions: ['api:*:view', 'api:*:find'] }};
        authz.isPermittedAsync(req, 'api:product:view').should.be.fulfilledWith(true);
        authz.isPermittedAsync(req, 'api:product:view:123').should.be.fulfilledWith(true);
        authz.isPermittedAsync(req, 'api:product:find').should.be.fulfilledWith(true);
        authz.isPermittedAsync(req, 'api:product:create').should.be.fulfilledWith(false);
        authz.isPermittedAsync(req, 'api:product:change:123').should.be.fulfilledWith(false);
        authz.isPermittedAsync(req, 'api:product:delete:123').should.be.fulfilledWith(false);
    });

    it('should allow a user to manage only one resource type', () => {
        let req = {user: { permissions: ['api:product:*'] }};
        authz.isPermittedAsync(req, 'api:product:view').should.be.fulfilledWith(true);
        authz.isPermittedAsync(req, 'api:product:view:123').should.be.fulfilledWith(true);
        authz.isPermittedAsync(req, 'api:product:find').should.be.fulfilledWith(true);
        authz.isPermittedAsync(req, 'api:product:create').should.be.fulfilledWith(true);
        authz.isPermittedAsync(req, 'api:product:change:123').should.be.fulfilledWith(true);
        authz.isPermittedAsync(req, 'api:product:delete:123').should.be.fulfilledWith(true);

        authz.isPermittedAsync(req, 'api:user:view').should.be.fulfilledWith(false);
        authz.isPermittedAsync(req, 'api:user:view:123').should.be.fulfilledWith(false);
        authz.isPermittedAsync(req, 'api:user:find').should.be.fulfilledWith(false);
        authz.isPermittedAsync(req, 'api:user:create').should.be.fulfilledWith(false);
        authz.isPermittedAsync(req, 'api:user:change:123').should.be.fulfilledWith(false);
        authz.isPermittedAsync(req, 'api:user:delete:123').should.be.fulfilledWith(false);
    });

    it('should determine if a referenced resource link is viewable', () => {
        let req = { user: { permissions: ['api:product:*'] }};
        authz.isPermittedToViewAsync(req, '/api/product/123').should.be.fulfilledWith(true);
        authz.isPermittedToViewAsync(req, '/api/customer/123').should.be.fulfilledWith(false);
    });

    it('should determine the resource level permission based on the request', () => {
        let req = { method: 'GET', path: '/product' };
        authz.resourceAccess(req).should.equal('api:product:find');

        req = { method: 'GET', path: '/product/123' };
        authz.resourceAccess(req).should.equal('api:product:view:123');

        req = { method: 'POST', path: '/product' };
        authz.resourceAccess(req).should.equal('api:product:create');

        req = { method: 'PATCH', path: '/product/123' };
        authz.resourceAccess(req).should.equal('api:product:change:123');

        req = { method: 'DELETE', path: '/product/123' };
        authz.resourceAccess(req).should.equal('api:product:delete:123');

        req = { method: 'POST', path: '/product/find' };
        authz.resourceAccess(req).should.equal('api:product:find');
    });

    it('should 403 when user is not permitted and is authenticated', done => {
        request(server)
            .get('/api-test/never')
            .expect(403)
            .expect(res => {
                res.body.message.should.equal("You need the permission 'never-ever-view-this-info' to perform this activity");
            })
            .end(done);
    });

    it('should 401 when user is not permitted and is not authenticated', done => {
        request(server)
            .get('/api-test/never')
            .set('Authorization', 'None x')
            .expect(401)
            .end(done);
    });

    it('should include WWW-Authenticate on 401', done => {
        request(server)
            .get('/api-test/never')
            .set('Authorization', 'None x')
            .expect(401)
            .expect(res => {
                res.header.should.have.property('www-authenticate');
            })
            .end(done);
    });

});
