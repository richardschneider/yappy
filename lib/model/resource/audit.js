'use strict';

var schema = require('js-schema-6901');

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
        when: String,
        fingerprint: String
    }),
    readOnly: true,
    db: 'sensitive'
};

