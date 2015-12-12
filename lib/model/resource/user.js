'use strict';

let schema = require('js-schema-6901'),
    link = require('../link'),
    text = require('../text'),
    permission = require('../permission');

module.exports = {
    schema: schema('A known person or service', {
        name: Array.of(text),
        displayName: Array.of(text),
        email: String,
        roles: Array.of(link),
        permissions: Array.of(permission)
    }),
    db: 'sensitive'
};

