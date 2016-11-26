'use strict';

let request = require('superagent');

var fixer = function (base, currencies, options) {
    let q = { base: base };
    if (Array.isArray(currencies))
        q.symbols = currencies.join(',');
    return request
        .get(options.api)
        .query(q)
        .then(res => {
            res.body.source = fixer.details.home;
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

