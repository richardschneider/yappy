'use strict';

/*
 * Middleware to determine if a subject (user or account or service) is permitted
 * to perform an activity (permission).
 */

let authz = require('express-authorization'),
    link = require('../model/link');

/*
 * Determine if the user is permitted to perform the activity (permission).
 */
function isPermitted (user, permission)
{
    //console.log('checking that', user.email, 'is permitted', permission);
    user.permissionsChecked = true;
    return authz.considerSubject(user).isPermitted(permission);
}

function isPermittedToView (user, resourceLink) {
    let r = link.parse(resourceLink);
    return isPermitted(user, `api:${r.type}:view:${r.id}`);
}

/*
 * Fails the request because the user is not permitted to perform the
 * activity.
 */
function denied(req, res, permission) {
    return res.sendError(
        req.user.isAuthenticated ? 403 : 401,
        `You need the permission '${permission}' to perform this activity`
    );
}

/*
 * Determines the CRUD permission from the the request.
 */
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
 * Adds isPermitted(permission) to 'req.user' and
 *      isPermittedToView(link)
 */
function authorisation (req, res, next) {
    req.user.isPermitted = permission => isPermitted(req.user, permission);
    req.user.isPermittedToView = resourceLink => isPermittedToView(req.user, resourceLink);
    req.user.permissionsChecked = false;

    next && next();
}

/*
 * Determines if the user has the permission to access this route.
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
        if (!isPermitted(req.user, permission))
            return denied(req, res, permission);
        next && next();
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
        if (!isPermitted(req.user, permission))
            return denied(req, res, permission);
        next && next();
    };
};

authorisation.isPermitted = isPermitted;
authorisation.isPermittedToView = isPermittedToView;
authorisation.resourceAccess = resourceAccess;

module.exports = authorisation;
