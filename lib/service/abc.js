'use strict';

let Promise = require("bluebird");

/**
 * Authentication for alice, bob and carol.  This is a sample authentication
 * service not to be used in production.
 */
let consumer_permissions = [
    'public:*', 'unclassified:view', 'api:*:view', 'api:*:find'
    ];
let producer_permissions = [
    'public:*', 'unclassified:view', 'restricted:view', 'api:*', 'api:*'
    ];
let owner_permissions = [
    'api:*', 'service:*', 'api-test:use', 'public:*',
    'unclassified:*', 'restricted:*', 'sensitive:*', 'secret:*', 'top-secret:*'
    ];

let secret = 'xyzzy',
    userpasswords = {
        'alice': secret,
        'bob': secret,
        'carol': secret
    },
    users = {
        'alice': {
            email: 'alice@abc.org',
            displayName: { tag: 'en', text: 'Alice'},
            name: { tag: 'en', text: "Tom's Alice"},
            homepage: 'https://www.youtube.com/watch?v=aEj-mrwwaxo',
            permissions: owner_permissions,
        },
        'bob': {
            email: 'bob@abc.org',
            displayName: { tag: 'en', text: 'Bob'},
            permissions: producer_permissions
        },
        'carol': {
            email: 'carol@abc.org',
            displayName: { tag: 'en', text: 'Carole'},
            permissions: consumer_permissions,
        }
    },
    not_found = new Error('not found');

let abc = function (req, options) {
    let auth = req.headers.authorization || '';
    if (auth.startsWith('Basic ')) {
        let token = new Buffer(auth.slice(6), 'base64').toString('utf8');
        let parts = token.split(':');
        if (parts.length === 2 && userpasswords[parts[0]] === parts[1]) {
            let user = users[parts[0]];
            return Promise.resolve(user);
        }
        return Promise.reject(new Error(`Username '${parts[0]}' not found or invalid password.`));
    }
    return Promise.reject(not_found);
};

abc.details = {
    name: [{tag: 'en', text: 'ABC authentication'}],
    use: 'authentication',
    enabled: true,
    home: 'https://github.com/richardschneider/yappy/issues/130',
    options: {
        trusted_for_authorization: true,
    }
};

module.exports = abc;

