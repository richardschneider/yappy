'use strict';

var schema = require('js-schema-6901');
var text = require('../text');
var iso = require('../iso');
var subdomain = require('../subdomain');
var extend = require('util')._extend;

var defaults = {
    currencies: ['USD', 'CNY', 'EUR', 'NZD'],
    languages: ['en', 'zh']
};

module.exports = {
    schema: schema('someone who owns and manages part of the ecom cloud', {
        name: Array.of(text),
        domain: subdomain,
        currencies: Array.of(iso.currencyCode),
        languages: Array.of(String)
    }),
    upgrade: r => extend(extend({}, defaults), r),
    db: 'sensitive'
};
