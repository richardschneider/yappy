'use strict';

/*
 * Middleware to determine if a subject (user or service) is permitted
 * to perform an activity.
 */

function isPermitted (user, permission)
{
    return true;
}

function authorisation (req, res, next) {
    req.user.isPermitted = permission => isPermitted(req.user, permission);

    next();
}

module.exports = authorisation;
