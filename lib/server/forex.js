'use strict';

var express = require('express');
var HttpError = require('node-http-error');
var app = express();
var locator = require('../service/locator');
var iso = require('../model/iso');

app.get('/:base?', function(req, res, next) {
    let forex = req.tenant.forex;
    let base = req.params.base || forex.base;
    if (!iso.currencyCode.test(base))
        return next(new HttpError(400, `'${base}' is not a currency code.`));

    locator
        .run(req.services.fxrates, req, base, forex.currencies)
        .then(fx => {
            let result = {
                source: fx.source,
                base: fx.base,
                date: fx.date,
                rates: {},
                _metadata: {
                    self: req.originalUrl,
                    type: 'forex'
                }
            };
            forex.currencies.forEach(c => {
                result.rates[c] = fx.rates[c];
            });
            result.rates[base] = 1;
            res
                .status(200)
                .set('last-modified', new Date(fx.date).toUTCString())
                .send(result)
                .end();
        })
        .catch(next);
});


module.exports = app;
