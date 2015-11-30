'use strict';

/*
 * Middleware to identify a subject (user or service).
 */

function authenticate (req, res, next) {
    let user = req.user = req.user || {};
    user.displayName = 'su';
    user.email = 'valhalla@wellington.co.nz';
    user.roles = ['most'];
    user.permissions = ['api:*', 'forex:*', 'api-test:use', 'public:*'];
    user._metadata = { self: '/api/whoami' };

    next();
}

module.exports = authenticate;
