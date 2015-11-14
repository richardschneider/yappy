'use strict';

var schema = require('js-schema-6901');
var iso = require('../iso');

module.exports = {
    schema: schema('Secure record of an event.', {
        who: String,
        where: {
            client: String,
            host: String,
            server: String
        },
        why: String,
        what: String,
        when: iso.dateTime,
        fingerprint: String
    }),
    readOnly: true,
    db: 'sensitive'
};

