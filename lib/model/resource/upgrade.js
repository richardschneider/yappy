'use strict';

var schema = require('js-schema-6901');

let upgrade = schema('An applied upgrade to the model', {
    version: String,
    appliedOn: String
});

module.exports = {
    schema: schema('Metadata on the model/schama/database.', {
        current: upgrade,
        history: Array.of(upgrade) // include current at tail
    }),
    collectionName: 'config',
    readOnly: true,
    tenantWide: true
};

