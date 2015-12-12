'use strict';

let schema = require('js-schema-6901'),
    text = require('../text'),
    permission = require('../permission');

module.exports = {
    schema: schema('Permissions for a job or activity to perform', {
        name: Array.of(text),
        description: Array.of(text),
        permissions: Array.of(permission)
    }),
    db: 'sensitive'
};

