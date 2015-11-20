'use strict';

let fs = require('fs');
let path = require('path');
let extend = require('util')._extend;
let _ = require('underscore');

let locator = {};

locator.allServices = [];

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

/*
 * Returns a promise to run the services until one resolves.  If none resolves
 * then a rejected promise with an error is returned.
 */
locator.run = function(usage) {
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
    if (services.length === 0)
        throw new Error('No service found for ' + usage);
    services = _.shuffle(services);
    
    // The arguments to pass to the service.
    let args = Array.prototype.slice.call(arguments, 1);
    
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
        try {
            return api
                .apply(this, argsPlus)
                .catch(serviceError);
        }
        catch (e) {
            return serviceError(e);
        }
    };
    let serviceError = e => {
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
