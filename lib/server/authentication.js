'use strict';

let mung = require('express-mung'),
    locator = require('../service/locator'),
    merge = require('deepmerge');

/*
 * Middleware to identify a subject (user or service).
 */

function authenticate (req, res, next) {

    // On 401 Unauthorized, we need to add the WWW-Authenticate header.
    function onUnauthorized (req, res) {
        if (res.statusCode == 401) {
            res.set('www-authenticate', authenticate.challenges(req, res));
        }
    }
    mung.headers(onUnauthorized)(req, res);

    // Find the user from credentials
    req.user = {
        displayName: { tag: 'en', text: 'anonymous' },
        email: 'anonymous@' + req.ip,
        isAuthenticated: false,
        permissions: ['public:*', 'unclassified:view', 'api:*:view'], // TODO: should be consumer role
        _metadata: { self: '/api/whoami' }
    };
    locator
        .run(req.services.authentication, req, req)
        .then(user => {
            delete user.role;
            delete user.permissions;
            req.user = merge(req.user, user);
            req.user.isAuthenticated = true;
            req.user.permissions = '*';  // TODO read the user to get roles and permissions
            next();
        })
        .catch(e => next());
}

/*
 * A function that returns the value(s) for the WWW-Authenticate header.
 *
 * Default is Basic and Bearer with the 'realm' equal to the tenant domain.
 */
authenticate.challenges = (req, res) => {
    let domain = req.tenant.domain;
    return [`Basic realm="${domain}"`, `Bearer realm="${domain}"`];
};

module.exports = authenticate;