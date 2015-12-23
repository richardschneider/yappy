'use strict';

let fs = require('fs');
let path = require('path');
let extend = require('util')._extend;
var peers = require('../pubsub');
let _ = require('underscore');

let locator = {};

locator.allServices = [];

/**
 * Find and load all the services in the ./lib/service folder.
 */
locator.loadAllServices = function() {
    locator.allServices = [];

    return locator.allServices = fs
        .readdirSync('./lib/service')
        .filter(n => n != 'locator.js')
        .map(filename => {
            let service = {
                moduleName: path.basename(filename, '.js')
            }
            service.api = require('./' + service.moduleName);
            extend(service, service.api.details || {});
            return service;
        });
};

/**
 * Returns a promise to run the services until one resolves.  If none resolves
 * then a rejected promise with an error is returned.
 *
 * @param {String|Array} usage - type of service to run or a list of services to run
 * @param {Request} req - optional express req
 * @params ... argument(s) to pass to the service
 *
 * If req is present, then a demand is made to run the service.
 */
locator.run = function(usage, req) {
try {
    // Find the services to use.
    let services;
    if (Array.isArray(usage)) {
        services = usage;
        usage = services.length > 0 ? services[0].use : 'unknown';
    }
    else if (typeof usage === 'string') {
        services = locator.allServices;
    }
    else
        throw new Error('Must be string or array of services');

    services = services.filter(service => service.use === usage && service.enabled);
    // TODO: Should not use Error because its not a Internal Server Error
    if (services.length === 0)
        throw new Error('No service found for ' + usage);
    services = _.shuffle(services);

    // The arguments to pass to the service.
    let args = Array.prototype.slice.call(arguments, 1);
    if (req && typeof req === 'object' && req.user && req.user.isPermittedAsync) {
        args.shift();
    } else {
        req = null;
    }

    // The chain of calls to perform.
    let service = null;
    let failures = {};
    let callNext = () => {
        service = services.shift();
        if (!service) {
            let err = new Error('All services failed for ' + usage);
            err.details = failures;
            return Promise.reject(err);
        }
        let api = service.api || require('./' + service.moduleName);
        let argsPlus = args.slice();
        argsPlus.push(service.options);
        return Promise.resolve(true)
            .then(() => {
                if (req) {
                    let permission = `service:${service.use}:use:${service.moduleName}`;
                    if (!req.user.isPermittedAsync(permission))
                        throw new Error(`You need the permission '${permission}' to perform this activity`);
                }
            })
            .then(() => api.apply(this, argsPlus))
            .then(result => {
                if (result && typeof result === 'object')
                {
                    result._metadata = result._metadata || {};
                    result._metadata.service = service.moduleName;
                }
                return result;
            })
            .catch(serviceError);
    };
    let serviceError = e => {
        let error = e.res && e.res.error // SuperagentPromiseError
            ? e.res.error
            : e;
        peers.publish(`/yappy/error/${service.moduleName}`, error);
        failures[service.moduleName] = e.message;
        return callNext();
    };

    // Start the call chain.
    return callNext();
} catch (e) {
    return Promise.reject(e);
}
};

module.exports = locator;
