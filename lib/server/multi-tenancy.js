'use strict';

var model = require('../model');
var locale = require('locale');

function mtCheck(o, tenantId) {
    if (Array.isArray(o)) {
        for (let e of o) {
            if (!mtCheck(e, tenantId))
                return false;
        }
        return true;
    }
    if (o === null || typeof o !== 'object')
        return true;
    if ('tenantId' in o) {
        if (o.tenantId != tenantId)
            return false;
        o.tenantId = undefined;
    }
    else if ('metadata' in o && 'tenantId' in o.metadata)
    {
        if (o.metadata.tenantId != tenantId)
            return false;
        o.metadata.tenantId = undefined;
    }
    return true;
}

function multi_tenancy (req, res, next) {
    // Until the tenant is found we need a language.
    res.locale = 'en';
    
    // monkey patch res.send so that non-tenant data is not exposed and 
    // remove the tenant id from the output.
    let send = res.send;
    res.send = function (body) {
        if (!mtCheck(body, req.tenantId))
            return res.sendError(403, 'Access to other tenant data is not allowed');
        return send.call(this, body);
    };
    
    // Determine the tenant id from the request's Host header.
    let parts = req.headers.host.split('.');
    var domain = parts[0];

    // Talking to ourself is a sign of poor mental health.  But in this
    // case it IS most likely a test being run.
    if (req.headers.host.startsWith('127.0.0.1'))
        domain = 'test';

    // Find the tenant with the domain.
    model
    .then(model => model.tenant.collection())
    .then(collection => collection.findOneAsync({ domain: domain }))
    .then(tenant => {
        if (tenant === null)
            return res.sendError(400, 'Check the host name, especially ' + domain);

        req.tenant = tenant;            
        req.tenantId = tenant.tenantId;

        // set req.locale
        locale.Locale['default'] = tenant.languages[0] || 'en';
        locale(tenant.languages)(req, res, () => null);
        
        next();
    });
}

module.exports = multi_tenancy;
