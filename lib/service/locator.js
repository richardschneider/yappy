'use strict';

var locator = {};

function findByUse(usage) {
    var services = locator.allServices.filter(service => service.use === usage && service.enabled);
    if (services.length === 0)
        throw new Error('No service found for ' + usage);
    return services;
}

locator.allServices = [];

locator.run = function(usage) {
    let args = Array.prototype.slice.call(arguments, 1)
    let services = findByUse(usage);
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
        };
    };
    let serviceError = e => {
        //console.log(service.moduleName, 'failed with', e.message);
        return callNext();
    };

    // Start the call chain.
    return callNext();
};

module.exports = locator;
