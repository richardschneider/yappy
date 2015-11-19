'use strict';

var schema = require('js-schema-6901');
var text = require('../text');
var iso = require('../iso');
var ietf = require('../ietf');
var subdomain = require('../subdomain');
var extend = require('util')._extend;
var locator = require('../../service/locator');

var defaults = {
    currencies: ['USD', 'CNY', 'EUR', 'NZD'],
    languages: ['en', 'zh'],
    services: locator.loadAllServices()
};

function upgrade(r) {
    let r1 = extend(extend({}, defaults), r);
    defaults.services.forEach(s0 => {
        if (!r1.services.find(s1 => s0.moduleName == s1.moduleName))
            r1.services.push(s0);
    });
    return r1;
}

module.exports = {
    schema: schema('someone who owns and manages part of the ecom cloud', {
        name: Array.of(text),
        domain: subdomain,
        currencies: Array.of(iso.currencyCode),
        languages: Array.of(ietf.languageTag)
    }),
    upgrade: upgrade,
    db: 'sensitive'
};
