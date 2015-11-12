'use strict';

var model = require('../model');

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

    // monkey patch res.send so that non-tenant data is not exposed and 
    // remove the tenant id from the output.
    let send = res.send;
    res.send = function (body) {
        if (!mtCheck(body, req.tenantId))
            return res.sendError(403, 'Access to other tenant data is not allowed');
        return send.call(this, body);
    };
    
    // Talking to ourself is a sign of poor mental health.  But in this
    // case it IS most likely a test being run.
    let isSelf = req.headers.host.startsWith('127.0.0.1');
    if (isSelf) {
        req.tenantId = 42;
        return next();
    }

    // Determine the tenant id from the request's Host header.
    let parts = req.headers.host.split('.');
    let domain = parts[0];
    
    // Find the tenant with the domain.
    let selector = { 
        domain: domain
    };
    model.tenant.db.collection('tenant')
        .findOneAsync(selector)
        .then(function(tenant) {
            if (tenant === null)
                return res.sendError(404, 'Check the host name, especially ' + domain);
                
            req.tenantId = tenant.tenantId;
        })
        .then(next);
}

module.exports = multi_tenancy;
