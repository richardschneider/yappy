'use strict';

/**
 * Basic authentication adaptor for stormpath.
 */

let Promise = require('bluebird'),
    user = require('../stormpath/user');

let not_found = new Error('not found');

let basic = function (req, options) {
    let auth = req.headers.authorization || '';
    if (auth.startsWith('Basic ')) {
        let token = new Buffer(auth.slice(6), 'base64').toString('utf8');
        let parts = token.split(':');
        if (parts.length === 2) {
            return user.authenticate(parts[0], parts[1]);
        }
    }
    return Promise.reject(not_found);
};

basic.details = {
    name: [{tag: 'en', text: 'Basic authentication using stormpath'}],
    use: 'authentication',
    enabled: true,
    home: 'https://stormpath.com/',
    options: { }
};

module.exports = basic;

