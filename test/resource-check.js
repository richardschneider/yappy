'use strict';

require('should');
let check = require('../lib/server/resource-check'),
    authorisation = require('../lib/server/authorisation');

describe ('Resource check', () => {

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

    it('should not permi restricted resources', () => {
        let x = [
            { name: 'a', apikey: 'a', _metadata: { type: 'x', self: '/api/x/1' }},
            { name: 'b', _metadata: { type: 'x', self: '/api/x/2' } },
            { name: 'c', apikey: 'c', _metadata: { type: 'x', self: '/api/x/3' }}
        ];
        req.user.permissions.push('api:x:view:1');
        req.user.permissions.push('api:x:view:3');
        check.isPermitted(x[0], req, res).should.be.true;
        check.isPermitted(x[1], req, res).should.be.false;
        check.isPermitted(x[2], req, res).should.be.true;
    });

});
