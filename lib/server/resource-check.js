'use strict';

let mung = require('./mung-resources');

/**
 * Determines if the resource can be viewed by the user.
 *
 * @param {Object} the resource to check
 * @returns {Object|null} null when the resource cannot be viewed.
 */
function isPermittedAsync (resource, req, res) {
    return req.user
        .isPermittedToViewAsync(resource._metadata.self)
        .then(permitted => permitted ? resource : null);
}

/*
 * Middleware to remove resources that the user is not permitted to view.
 */
function resource_check (req, res, next) {
    mung.resourcesAsync(isPermittedAsync)(req, res);

    next();
}

resource_check.isPermittedAsync = isPermittedAsync;

module.exports = resource_check;
