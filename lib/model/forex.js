'use strict';

let schema = require('js-schema-6901'),
    iso = require('./iso');

let rates = schema('The exchange rates', {
    '*': Number,
});

module.exports = schema('Foreign Exchange rates', {
    source: String,
    base: iso.currencyCode,
    date: iso.dateTime,
    rates: rates
});
