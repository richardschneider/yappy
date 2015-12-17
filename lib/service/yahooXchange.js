'use strict';

let request = require('../superagent-bluebird-promise');

var xchange = function (base, currencies, options) {
    if (!Array.isArray(currencies) || currencies.length == 0)
        return Promise.reject(new Error('currencies must not be empty'));

    let pairs = currencies
        .map(c => '"' + base + c + '"')
        .join(',');
    let q = {
        format: 'json',
        q: options.yql.replace('{0}', pairs),
        env: options.env
    };
    return request
        .get(options.api)
        .query(q)
        .then(res => {
            let fx = {
                source: 'Yahoo eXchange',
                base: base,
                date: res.body.query.created,
                rates: {}
            };
            res.body.query.results.rate.forEach(r => {
                let symbol = r.id.substring(base.length);
                let rate = Number.parseFloat(r.Rate);
                if (isNaN(rate))
                    throw new Error(`missing exchange rate for '${base}-${symbol}'`);
                fx.rates[symbol] = rate;
            });

            if (currencies.length != Object.keys(fx.rates).length)
                return Promise.reject(new Error('missing exchange rate for some currencies'));

            return fx;
        })
        .catch(e => {
            console.log('yahooXchange error', e);
            return Promise.reject(e);
        });
};

xchange.details = {
    name: [{tag: 'en', text: 'forex rates from Yahoo Financial XChange'}],
    use: 'fxrates',
    enabled: true,
    home: 'https://developer.yahoo.com/yql/console/?q=show tables&env=store://datatables.org/alltableswithkeys#h=desc+yahoo.finance.xchange',
    options: {
        api: 'http://query.yahooapis.com/v1/public/yql',
        yql: 'select * from yahoo.finance.xchange where pair in ({0})',
        env: 'store://datatables.org/alltableswithkeys'
    },
};

module.exports = xchange;

