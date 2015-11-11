'use strict';

var schema = require('js-schema-6901');
var text = require('./text');

module.exports = schema(' someone who owns and manages part of the ecom cloud', {
    name: Array.of(text)
});
