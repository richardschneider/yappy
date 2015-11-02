'use strict';

var schema = require('js-schema');
var text = require('./text');

module.exports = schema('Not the drinking kind.', {
    name: Array.of(text)
});
