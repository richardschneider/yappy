'use strict';

var schema = require('js-schema-6901');
var text = require('../text');
var subdomain = require('../subdomain');

module.exports = {
    schema: schema('someone who owns and manages part of the ecom cloud', {
        name: Array.of(text),
        domain: subdomain
    }),
    db: 'sensitive'
};
