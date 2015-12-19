'use strict';

let schema = require('js-schema-6901'),
    text = require('../text');

module.exports = {
    schema: schema('Somewhere to hide', {
        name: Array.of(text),
        location: String // TODO: geo location
    }),
};

