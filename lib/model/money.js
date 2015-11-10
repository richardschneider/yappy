'use strict';

var schema = require('js-schema');

module.exports = schema({
    code: /^[A-Z]{3}$/,
    amount: /^\d+(\.\d{1,4})?$/
});

