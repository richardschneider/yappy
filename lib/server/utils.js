'use strict';

let qs = require('qs');

function isResource(o) {
    return o && o._metadata && o._metadata.type && !o._metadata.partial;
}

/**
 * Return all the resources in the response body.
 *
 * @param {Object} body
 * @return {Array}
 * @api private
 */
 exports.resourcesIn = function resourcesIn(body) {
    if (!body) return [];
    let content = body.data || (Array.isArray(body) ? body : [body]);
    return content.filter(r => isResource(r));
 };

/**
 * Determines if the body is just one resource.
 *
 * @param {Object} body
 * @return {Boolean}
 * @api private
 */
exports.isSingletonResource = isResource;

/**
 * Determines if the body contains a resource.
 *
 * @param {Object} body
 * @return {Boolean}
 * @api private
 */
exports.containsResource = function(body) {
    return body && (isResource(body) || body.data);
};

/**
 * Convert a singleton resource into a search result.
 *
 * @param {Object} req
 * @param {Object} body
 * @return {Object}
 * @api private
 */
exports.toSearchResult = function toSearchResult(req, body) {
    if (!isResource(body))
        return body;

    let self = body._metadata.self;
    if (req.query)
        self += '?' + qs.stringify(req.query, { indices: false, encode: false });

    return {
        links: { self: self },
        data: [body]
    };
};
