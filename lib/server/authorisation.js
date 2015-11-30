'use strict';

let authz = require('express-authorization');

/*
 * Middleware to determine if a subject (user or service) is permitted
 * to perform an activity.
 */

function isPermitted (user, permission)
{
    return authz.considerSubject(user).isPermitted(permission);
}

function denied(req, res, permission) {
    return res.sendError(403, `You need the permission '${permission}' to perform this activity`);
}

// Adds isPermitted(permission) to 'req.user'
function authorisation (req, res, next) {
    req.user.isPermitted = permission => isPermitted(req.user, permission);

    next();
}

// Enforces the permission check.
authorisation.allows = (permission) => {
    return (req, res, next) => {
        if (!isPermitted(req.user, permission))
            return denied(req, res, permission);
        next && next();
    };
};

authorisation.isPermitted = isPermitted;

module.exports = authorisation;
