'use strict';

let fs = require('fs');
let path = require('path');
let extend = require('util')._extend;

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

    // The arguments to pass to the service.
    let args = Array.prototype.slice.call(arguments, 1);
    
    // The chain of calls to perform.
    var service = null;
    let callNext = () => {
        service = services.shift();
        if (!service) {
            return Promise.reject(new Error('All services failed for ' + usage));
        }
        let api = service.api || require('./' + service.moduleName);
        let argsPlus = args.slice();
        argsPlus.push(service.options);
        //console.log('calling', service.moduleName, argsPlus);
        try {
            return api
                .apply(this, argsPlus)
                .catch(serviceError);
        }
        catch (e) {
            return Promise.reject(e);
        }
    };
    let serviceError = e => {
        //console.log(service.moduleName, 'failed with', e.message);
        return callNext();
    };

    // Start the call chain.
    return callNext();
} catch (e) {
    return Promise.reject(e);
}
};

module.exports = locator;
