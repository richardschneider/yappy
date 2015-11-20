'use strict';

var schema = require('js-schema-6901');
var text = require('../text');
var iso = require('../iso');
var ietf = require('../ietf');
var subdomain = require('../subdomain');
var service = require('../service');
var extend = require('util')._extend;
var locator = require('../../service/locator');

var defaults = {
    forex: {
        base: 'NZD',
        currencies: ['USD', 'CNY', 'EUR', 'NZD']
    },
    languages: ['en', 'zh'],
    services: locator.loadAllServices()
};

function upgrade(r) {
    let r1 = extend(extend({}, defaults), r);
    defaults.services.forEach(s0 => {
        if (!r1.services.find(s1 => s0.moduleName == s1.moduleName))
            r1.services.push(s0);
    });
    if (r1.currencies)
    {
        r1.forex = {
            base: r1.baseCurrency || defaults.forex.base,
            currencies: r1.currencies
        }
        r1.baseCurrency = r1.currencies = undefined;
    }
    return r1;
}

module.exports = {
    schema: schema('someone who owns and manages part of the ecom cloud', {
        name: Array.of(text),
        domain: subdomain,
        languages: Array.of(ietf.languageTag),
        forex: schema('foreign exchange', {
            base: iso.currencyCode,
            currencies: Array.of(iso.currencyCode)
        }),
        services: Array.of(service)
    }),
    upgrade: upgrade,
    db: 'sensitive'
};
