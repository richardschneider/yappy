'use strict';

var schema = require('js-schema-6901');

module.exports = {
    schema: schema('Various configuration documents', {
    }),
    readOnly: true,
    tenantWide: true
};

