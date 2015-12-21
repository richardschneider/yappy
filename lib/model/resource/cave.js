'use strict';

let schema = require('js-schema-6901'),
    text = require('../text'),
    geometry = require('../geometry');

module.exports = {
    schema: schema('Somewhere to hide', {
        name: Array.of(text),
        location: geometry
    }),
};

