'use strict';

let request = require('../superagent-bluebird-promise');

var fixer = function (base, options) {
    return request
        .get(options.api)
        .query({ base: base })
        .then(res => {
            // The rates are updated daily around 3PM CET.
            res.body.date += 'T02:00:00Z';
            return res.body;
        });
};

fixer.details = {
    name: [{tag: 'en', text: 'forex rates from fixer.io'}],
    use: 'fxrates',
    enabled: true,
    home: 'http://fixer.io',
    options: {
        api: 'https://api.fixer.io/latest'
    },
};

module.exports = fixer;

