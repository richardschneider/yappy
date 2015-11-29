'use strict';

/*
 * Middleware to identify a subject (user or service).
 */

function authenticate (req, res, next) {
    let user = req.user = req.user || {};
    user.displayName = 'su';
    user.roles = ['all'];
    user.claims = ['*'];
    user._metadata = { self: '/api/whoami' };

    next();
}

module.exports = authenticate;
