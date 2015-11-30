'use strict';

let authz = require("../lib/server/authorisation");

describe('Authorisation', function () {

    it('should allow read-only users to resources', () => {
        let user = { permissions: ['api:*:view', 'api:*:find'] };
        authz.isPermitted(user, 'api:product:view').should.be.true;
        authz.isPermitted(user, 'api:product:view:123').should.be.true;
        authz.isPermitted(user, 'api:product:find').should.be.true;
        authz.isPermitted(user, 'api:product:create').should.be.false;
        authz.isPermitted(user, 'api:product:change:123').should.be.false;
        authz.isPermitted(user, 'api:product:delete:123').should.be.false;
    });

    it('should allow a user to manage only one resource type', () => {
        let user = { permissions: ['api:product:*'] };
        authz.isPermitted(user, 'api:product:view').should.be.true;
        authz.isPermitted(user, 'api:product:view:123').should.be.true;
        authz.isPermitted(user, 'api:product:find').should.be.true;
        authz.isPermitted(user, 'api:product:create').should.be.true;
        authz.isPermitted(user, 'api:product:change:123').should.be.true;
        authz.isPermitted(user, 'api:product:delete:123').should.be.true;

        authz.isPermitted(user, 'api:user:view').should.be.false;
        authz.isPermitted(user, 'api:user:view:123').should.be.false;
        authz.isPermitted(user, 'api:user:find').should.be.false;
        authz.isPermitted(user, 'api:user:create').should.be.false;
        authz.isPermitted(user, 'api:user:change:123').should.be.false;
        authz.isPermitted(user, 'api:user:delete:123').should.be.false;
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
    });

});
