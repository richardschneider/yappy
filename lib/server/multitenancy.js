'use strict';

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

function multitenancy (req, res, next) {
    req.tenantId = 42; // TODO: find the tenant id

    let send = res.send;
    res.send = function (body) {
        if (!mtCheck(body, req.tenantId))
            return res.sendError(403, 'Access to other tenant data is not allowed');
        return send.call(this, body);
    };
  
    next();
}

module.exports = multitenancy;
