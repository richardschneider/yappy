'use strict';

let authz = require('express-authorization');

/*
 * Middleware to determine if a subject (user or service) is permitted
 * to perform an activity.
 */

function isPermitted (user, permission)
{
    //console.log('checking that', user.email, 'is permitted', permission);
    return authz.considerSubject(user).isPermitted(permission);
}

function denied(req, res, permission) {
    return res.sendError(403, `You need the permission '${permission}' to perform this activity`);
}

let method2Verb = {
    GET: 'view',
    POST: 'create',
    PUT: 'change',
    PATCH: 'change',
    DELETE: 'delete'
};

function resourceAccess(req) {
    let verb = method2Verb[req.method];
    if (!verb)
        throw new Error(`Cannot determine resource access permission for '${req.path}'`);

    let noun = '';
    let id = '';
    let parts = req.path.substring(1).split('/');
    switch (parts.length) {
        case 1:
            noun = parts[0];
            if (verb == 'view')
                verb = 'find';
            break;

        case 2:
            noun = parts[0];
            id = parts[1];
            break;

        default:
            throw new Error(`Cannot determine resource access permission for '${req.path}'`);
    }

    return `api:${noun}:${verb}` + (id ? ':' + id : '');
}

// Adds isPermitted(permission) to 'req.user'
function authorisation (req, res, next) {
    req.user.isPermitted = permission => isPermitted(req.user, permission);

    next && next();
}

// Enforces the permission check.
authorisation.allows = (permission) => {
    return (req, res, next) => {
        if (!isPermitted(req.user, permission))
            return denied(req, res, permission);
        next && next();
    };
};

authorisation.allowsResourceAccess = () => {
    return (req, res, next) => {
        let permission = resourceAccess(req);
        if (!isPermitted(req.user, permission))
            return denied(req, res, permission);
        next && next();
    };
};

authorisation.isPermitted = isPermitted;
authorisation.resourceAccess = resourceAccess;

module.exports = authorisation;
