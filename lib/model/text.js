'use strict';

let schema = require('js-schema-6901');
let ietf = require('./ietf');

module.exports = schema({
    tag: ietf.languageTag,
    text: String
});

