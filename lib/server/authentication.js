'use strict';

let mung = require('express-mung');

/*
 * Middleware to identify a subject (user or service).
 */

function authenticate (req, res, next) {

    // A dummy user with lots of permissions.
    let user = req.user = req.user || {};
    user.displayName = 'su';
    user.email = 'valhalla@wellington.co.nz';
    user.roles = ['most'];
    // TODO: public => unclassified
    user.permissions = ['api:*', 'forex:*', 'api-test:use', 'public:*', 
        'unclassified:*', 'restricted:*', 'sensitive:*', 'secret:*', 'top-secret:*'];
    user.isAuthenticated = false;
    user._metadata = { self: '/api/whoami' };

    // On 401 Unauthorized, we need to add the WWW-Authenticate header.
    function onUnauthorized (req, res) {
        if (res.statusCode == 401) {
            res.set('www-authenticate', authenticate.challenges(req, res));
        }
    }
    mung.headers(onUnauthorized)(req, res);

    next();
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