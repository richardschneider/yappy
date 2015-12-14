'use strict';

let Promise = require("bluebird");

/**
 * Authentication for alice, bob and carol.  This is a sample authentication
 * service not to be used in production.
 */

let secret = 'xyzzy',
    userpasswords = {
        'alice': secret,
        'bob': secret,
        'carol': secret
    },
    users = {
        'alice': { email: 'alice@abc.org', displayName: { tag: 'en', text: 'Alice'}},
        'bob': { email: 'bob@abc.org', displayName: { tag: 'en', text: 'Bob'} },
        'carol': { email: 'carol@abc.org', displayName: { tag: 'en', text: 'Carole'} }
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
    options: { }
};

module.exports = abc;

