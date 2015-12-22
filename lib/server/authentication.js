'use strict';

let mung = require('express-mung'),
    locator = require('../service/locator'),
    merge = require('deepmerge');

let consumer_permissions = ['public:*', 'unclassified:view', 'api:*:view', 'api:*:find'];

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

    // Default to un-authenticated user.
    req.user = {
        displayName: { tag: 'en', text: 'anonymous' },
        email: 'anonymous@' + req.ip,
        isAuthenticated: false,
        permissions: consumer_permissions, // TODO: should be consumer role
        roles: [],
        _metadata: { self: '/api/whoami' }
    };

    // Must have a tenant.

    // Find the user from credentials.
    if (req.headers.authorization) {
        locator
            .run(req.services.authentication, req, req)
            .then(user => {

                // Only allow roles and permissions when the service is trusted
                // for authorisation.
                let serviceName = user._metadata.service;
                if (!req.tenant.service[serviceName].options.trusted_for_authorization) {
                    delete user.roles;
                    delete user.permissions;
                }

                // We have an authenticated user.
                req.user = merge(req.user, user);
                req.user.isAuthenticated = true;

                // TODO read the user to get roles and permissions

                next();
            })
            .catch(e => {
                res.sendError(401, 'Invalid credentials, correct the HTTP Authorization header.', e.details);
            });
    } else {
        next();
    }
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