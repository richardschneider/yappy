'use strict';

let model = require('../model');
let link = require('../model/link');
let locale = require('locale');
let config = require("config");
let Cache = require('cached-promise');
let peers = require('../pubsub');
let mung = require('./mung-resources');
let HttpError = require('node-http-error');

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
peers.subscribe('/yappy/api*');
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


function multi_tenancy (req, res, next) {
    // Until the tenant is found we need a language. The lang query parameter
    // overrides the accept-language header.
    req.query = req.query || {};
    req.locale = req.query.lang || fallbackLanguage;
    req.headers["accept-language"] = req.query.lang || req.headers["accept-language"];

    // All results should have the tenantId removed.  If accessing another
    // tenant's then 403 Forbidden.
    function mungResource (resource, req, res) {
        let allowed = {};
        allowed[req.tenantId] = true;

        // If just created the tenant, then it can be seen.
        if (req.method == 'POST') {
            let location = res.get('location') || '';
            if (location.startsWith('/api/tenant')) {
                allowed[link.parse(location).id] = true;
            }
        }

        if ('tenantId' in resource) {
            if (!allowed[resource.tenantId])
                return res.sendError(403, 'Access to other tenant data is not allowed');
            delete resource.tenantId;
        }
        if (resource.metadata && 'tenantId' in resource.metadata) { // hack for media resource
            if (!allowed[resource.metadata.tenantId])
                return res.sendError(403, 'Access to other tenant data is not allowed');
            delete resource.metadata.tenantId;
        }
    }
    mung.resources(mungResource)(req, res);

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
            }

            next();
        })
        .catch(() => {
            // build a default tenant and services so that other middleware
            // doesn't blow up.
            req.tenant = require('../model/resource/tenant').upgrade({
                name: { tag: 'en', text: '***unknown***' },
                domain: '',
                tenantId: ''
            });
            req.tenantId = req.tenant.tenantId;
            req.services = {};

            // Raise an error
            return next(new HttpError(400, 'Check the host name, especially ' + domain));
        });
}

module.exports = multi_tenancy;
