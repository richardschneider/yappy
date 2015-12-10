'use strict';

let mung = require('./mung-resources');

/*
 * Middleware to remove resources that the user is not permitted to view.
 */

function isPermitted(resource, req, res) {
    return req.user.isPermittedToView(resource._metadata.self);
}

function resource_check (req, res, next) {
    function check (resource, req, res) {
        return isPermitted(resource, req, res) ? resource : null;
    }
    mung.resources(check)(req, res);

    next();
}

resource_check.isPermitted = isPermitted;

module.exports = resource_check;
