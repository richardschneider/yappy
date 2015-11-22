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
    language: {
        fallback: 'en',
        supported: ['en', 'fr','zh']
    },
    services: locator.loadAllServices()
};

function upgrade(r) {
    let r1 = extend(extend({}, defaults), r);
    
    // 20-Nov-2015 forex and language became objects 
    if (r1.currencies) {
        r1.forex = {
            base: r1.baseCurrency || defaults.forex.base,
            currencies: r1.currencies
        };
    }
    if (r1.languages) {
        r1.language = {
            fallback: defaults.language.fallback,
            supported: r1.languages
        };
    }
    r1.baseCurrency = r1.currencies = r1.languages = undefined;
    
    // 22-Nov-2015 Services array becomes Service object keyed by moduleName
    r1.service = r1.service || {};
    if (r1.services) {
        r1.services.forEach(s => r1.service[s.moduleName] = r1.service[s.moduleName] || s);
    }
    r1.services = undefined;
    
    return r1;
}

module.exports = {
    schema: schema('someone who owns and manages part of the ecom cloud', {
        name: Array.of(text),
        domain: subdomain,
        forex: schema('foreign exchange', {
            base: iso.currencyCode,
            currencies: Array.of(iso.currencyCode)
        }),
        language: schema('language translation', {
            fallback: ietf.languageTag,
            supported: Array.of(ietf.languageTag)
        }),
        service: schema('all services', {
            '*': service
        })
    }),
    upgrade: upgrade,
    db: 'sensitive'
};
