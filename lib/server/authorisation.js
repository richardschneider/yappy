'use strict';

/*
 * Middleware to determine if a subject (user or account or service) is permitted
 * to perform an activity (permission).
 */

let authz = require('express-authorization'),
    link = require('../model/link'),
    security = require('../secure-data'),
    Promise = require('bluebird'),
    HttpError = require('node-http-error'),
    myself = require('./myself');

/*
 * A promise to determine if the user associated with the request is permitted to perform
 * the activity (permission).  First the user's permissions are checked, then each of the
 * user's roles are checked.
 */
function isPermittedAsync (req, permission)
{
    let user = req.user;
    user.permissionsChecked = true;

    //console.log('checking that', user.email, 'is permitted', permission);
    if (authz.considerSubject(user).isPermitted(permission))
        return Promise.resolve(true);

    if (user.roles && user.roles.length > 0) {
        return Promise
            .map(user.roles, url => myself(req).get(url).then(res => res.body))
            .filter(role => authz.considerSubject(role).isPermitted(permission))
            .any(() => true)
            .catch(RangeError, () => false);
    }

    return Promise.resolve(false);
}

function isPermittedToViewAsync (req, resourceLink) {
    // If not a resource link, then it can be viewed.
    let r = link.tryParse(resourceLink);
    if (!r)
        return Promise.resolve(true);

    let permission = `api:${r.type}:view:${r.id}`;
    return isPermittedAsync(req, permission);
}

/*
 * Returns an HTTP error that describes why the request is denied.
 */
function denied(req, res, permission, details) {
    return new HttpError(
        req.user.isAuthenticated ? 403 : 401,
        `You need the permission '${permission}' to perform this activity`,
        { details: details}
    );
}

/*
 * Determines the CRUD permission from the the request.
 */
let method2Verb = {
    HEAD: 'view',
    OPTIONS: 'view',
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
    if (parts.length == 1) {
        noun = parts[0];
        if (verb == 'view')
            verb = 'find';
    } else if (parts.length > 1) {
        noun = parts[0];
        id = parts[1];
    } else {
        throw new Error(`Cannot determine resource access permission for '${req.path}'`);
    }

    return `api:${noun}:${verb}` + (id ? ':' + id : '');
}

/*
 * Adds isPermittedAsync(permission) to 'req.user' and
 *      isPermittedToViewAsync(link)
 */
function authorisation (req, res, next) {
    req.user.isPermittedAsync = permission => isPermittedAsync(req, permission);
    req.user.isPermittedToViewAsync = resourceLink => isPermittedToViewAsync(req, resourceLink);
    req.user.demandAsync = (activity, resourceLink, jsonPointer) => {
        let permission;
        if (!resourceLink && !jsonPointer) {
            permission = activity;
        } else {
            let r = link.tryParse(resourceLink);
            if (!r)
                return Promise.resolve(true);

            let scope = 'api';
            let xtras = '';
            if (jsonPointer)
            {
                scope = security.securityLevelOf(jsonPointer);
                xtras = jsonPointer.replace(/\//, ':');
            }
            permission = `${scope}:${r.type}:${activity}:${r.id}${xtras}`;
        }
        return isPermittedAsync(req, permission)
            .then(permitted => {
                if (!permitted)
                    return next(denied(req, res, permission));
            })
            .catch(e => next(denied(req, res, permission, e)));
    };

    req.user.permissionsChecked = false;

    if (next)
        next();
}

/*
 * Demands that the user has the permission to access this route.  If no permission, then an
 * HTTP erorr is sent as the response and the 'next' function is not called.
 *
 *     let authz = require('./authorisation')
 *
 *     // all routes demand the permission
 *     app.use(authz.demand('forex:use'));
 *
 *     // the specified route demands the permission
 *     app.get('/api/whoami', authz.demand('public:view'), function(req, res) {
 */
authorisation.demand = (permission) => {
    return (req, res, next) => {
        return isPermittedAsync(req, permission)
            .then(permitted => {
                if (!permitted)
                    return next(denied(req, res, permission));
                next();
            })
            .catch(e => next(denied(req, res, permission, e)));
    };
};

/*
 * Based on the request determine the permissionactivity that is needed for
 * the activity, such as 'POST /api/bear' needs 'api:bear:create'.  Then check
 * that the user is permitted the activity.  If not then denied is called.
 *
 * This intended to be placed in an app that performs CRUD operations; such as
 *
 *    app.use(require('./authorisation').demandResourceAccess());
 *
 * Then every route (app.get, app.post, ...) will check the user's permissions
 * to access the resource.
 */
authorisation.demandResourceAccess = () => {
    return (req, res, next) => {
        let permission = resourceAccess(req);
        return isPermittedAsync(req, permission)
            .then(permitted => {
                if (!permitted)
                    return next(denied(req, res, permission));
                next();
            })
            .catch(e => next(denied(req, res, permission, e)));
    };
};

authorisation.isPermittedAsync = isPermittedAsync;
authorisation.isPermittedToViewAsync = isPermittedToViewAsync;
authorisation.resourceAccess = resourceAccess;

module.exports = authorisation;
