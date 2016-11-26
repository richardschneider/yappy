'use strict';

let request = require('superagent');

var currencyLayer = function (base, currencies, options) {
    let apiKey = options['!apikey'] || process.env.CurrencyLayerKey;
    if (!apiKey)
        return Promise.reject(new Error('need the CurrencyLayerKey'));

    return request
        .get(options.api)
        .query({
            access_key: apiKey,
            source: base
        })
        .then(res => {
            let result = res.body;
            if (!result.success)
                return Promise.reject(new Error(result.error.info));
            
            let fxrates = {
                source: currencyLayer.details.home,
                base: result.source,
                date: new Date(result.timestamp * 1000).toISOString(),
                rates: {}
            };
            for (let fromto in result.quotes) {
                let to = fromto.substring(result.source.length);
                fxrates.rates[to] = result.quotes[fromto];
            }
            return fxrates;
        });
};

currencyLayer.details = {
    name: [{tag: 'en', text: 'forex rates from currency layer'}],
    use: 'fxrates',
    enabled: false,
    home: 'http://www.currencylayer.com',
    options: {
        api: 'http://apilayer.net/api/live',
    },
};

module.exports = currencyLayer;

