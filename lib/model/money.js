'use strict';

var schema = require('js-schema-6901');
var iso = require('./iso');

module.exports = schema({
    code: iso.currencyCode,
    amount: /^\d+(\.\d{1,4})?$/
});

