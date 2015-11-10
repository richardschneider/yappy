'use strict';

var schema = require('js-schema-6901');
var text = require('./text');

module.exports = schema('Not the drinking kind.', {
    name: Array.of(text)
});
