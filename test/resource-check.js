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
        let doc = check.removeRestrictedResources(searchResults, req, res);
        let data = doc.data.filter(e => e); // remove undefined elements
        data.should.have.lengthOf(2);
    });

});
