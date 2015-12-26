'use strict';

/**
 * Middleware to cache a resource. Only GET and HEAD methods to a resource link are cacheable.
 */

let link = require('../model/link'),
    lru = require('lru-cache'),
    mung = require('./mung-resources'),
    extend = require('util')._extend,
    peers = require('../pubsub');

let cache = lru(10 * 1024);

/**
 * Add a resource to the cache.
 */
function add_resource(resource) {
    let key = resource._metadata.self;
    if (!cache.has(key)) {
        cache.set(key, extend({}, resource));
    }
    return resource;
}

/**
 * Invalidate the cache when a resource changes.
 */
peers.subscribe('/yappy/api*');
peers.on('message', (topic, id) => {
    cache.del(id);
});

/**
 * Responds with the cached resource or continues the middleware pipeline.
 */
function resource_cache (req, res, next) {
    mung.resources(add_resource)(req, res);

    if ((req.method == 'GET' || req.method == 'HEAD') && link.tryParse(req.url)) {
        let resource = cache.get(req.url);
        if (resource) {
            resource = extend({}, resource);
            return res
                .set('Last-Modified', new Date(resource.modifiedOn).toUTCString())
                .send(resource)
                .end();
        }
    }

    next();
}

module.exports = resource_cache;
