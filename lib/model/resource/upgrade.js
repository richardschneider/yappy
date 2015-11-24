'use strict';

var schema = require('js-schema-6901');
var iso = require('../iso');

let upgrade = schema('An applied upgrade to the model', {
    version: String,
    appliedOn: iso.dateTime
});

module.exports = {
    schema: schema('Metadata on the model/schema/database.', {
        current: upgrade,
        history: Array.of(upgrade) // include current at tail
    }),
    collectionName: 'config',
    readOnly: true,
    tenantWide: true
};

