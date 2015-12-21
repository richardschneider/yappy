'use strict';

var schema = require('js-schema-6901');

module.exports = schema({
    type: String,
    coordinates: Array.of(Number)
});

