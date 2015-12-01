'use strict';

/*
 * Middleware to identify a subject (user or service).
 */

function authenticate (req, res, next) {

    // A dummy user with lots of permissions.
    let user = req.user = req.user || {};
    user.displayName = 'su';
    user.email = 'valhalla@wellington.co.nz';
    user.roles = ['most'];
    user.permissions = ['api:*', 'forex:*', 'api-test:use', 'public:*'];
    user.isAuthenticated = false;
    user._metadata = { self: '/api/whoami' };

    // On 401 Unauthorized, we need to add the WWW-Authenticate header.
    // monkey patch
    let send = res.send;
    res.send = function (body) {
        if (res.statusCode == 401) {
            res.set('www-authenticate', authenticate.challenges(req, res));
        }
        return send.call(this, body);
    };

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