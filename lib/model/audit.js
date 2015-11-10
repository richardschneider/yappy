'use strict';

var schema = require('js-schema');

module.exports = schema('Secure record of an event.', {
    who: String,
    where: {
        client: String,
        server: String
    },
    why: String,
    what: String,
    when: String,
    fingerprint: String
});

