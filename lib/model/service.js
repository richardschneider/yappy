'use strict';

let schema = require('js-schema-6901');
let text = require('./text');

module.exports = schema('A promise to provide something', {
    name: Array.of(text),
    use: String,
    options: undefined,
    enabled: Boolean,
    home: String /* a URL */,
    moduleName: String
});
