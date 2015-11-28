'use strict';

let model = require('../model');
let locale = require('locale');
let config = require("config");
let Cache = require('cached-promise');
let peers = require('../pubsub');
let locator = require('../service/locator');

let fallbackLanguage = config.get('language') || 'en';

/*
 * A cache of tenants keyed by the domain name.
 */
var domains = new Cache({
  max: 100,
  load: function (key, resolve, reject) {
    let domain = key.key;
    let dataModel;
    model
        .then(model => {
            dataModel = model.tenant;
            return model.tenant.collection().findOneAsync({ domain: domain });
        })
        .then(tenant => {
            if (tenant === null)
                reject(domain);
            else
                resolve(dataModel.upgrade(tenant));
        });
  }
});

/*
 * Invalidates the cache when a tenant changes.
 */
peers.subscribe('/ecom/api*');
peers.on('message', function(topic, id) {
    if (!topic.endsWith('change/tenant')) return;

    let _id = id.split('/').pop();
    domains._cache.forEach(tenant => {
        if (tenant && tenant.tenantId == _id)
        {
            domains.del(tenant.domain);
        }
    });
});

function mtCheck(o, tenantId) {
    if (o.data)
        o = o.data;
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
    // Until the tenant is found we need a language. The lang query parameter
    // overrides the accept-language header.
    req.query = req.query || {};
    req.locale = req.query.lang || fallbackLanguage;
    req.headers["accept-language"] = req.query.lang || req.headers["accept-language"];

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

    // Find the tenant with the domain. The request processing chain is
    // stalled until we get a tenant.  Other request can still be processed.
    domains
        .get(domain)
        .then(tenant => {
            req.tenant = tenant;
            req.tenantId = tenant.tenantId;

            // set req.locale to the best language
            locale.Locale['default'] = tenant.language.fallback || fallbackLanguage;
            locale(tenant.language.supported)(req, res, () => null);

            // Services are tenant specific.  Add the service.use as an
            // array of services for the use.
            let services = req.services = {};
            for (var name in tenant.service) {
                let service = tenant.service[name];
                let use = services[service.use] = services[service.use] || [];
                use.push(service);
            };

            next();
        })
        .catch(() => {
            // build a default tenant and services so that other middleware
            // doesn't blow up.
            try {
                req.tenant = require('../model/resource/tenant').upgrade({
                    name: { tag: 'en', text: '***unknown***' },
                    domain: '',
                    tenantId: ''
                });
                req.tenantId = req.tenant.tenantId;
                req.services = {};
                return res.sendError(400, 'Check the host name, especially ' + domain);
            } catch (e) {
                console.error('missing domain double fault', e); // this is really not expected
            }
        });
}

module.exports = multi_tenancy;
