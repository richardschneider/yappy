'use strict';

var schema = require('js-schema');
var text = require('./text');

module.exports = schema({
    name: Array.of(text)
});
