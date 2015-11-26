'use strict';

var express = require('express');
var app = express();
var locator = require('../service/locator');
var iso = require('../model/iso');


app.get('/:base?', function(req, res, next) {
    let forex = req.tenant.forex;
    let base = req.params.base || forex.base;
    if (!iso.currencyCode.test(base)) {
        return res.sendError(400, `'${base}' is not a currency code.`);
    }
    
    locator
        .run(req.services.fxrates, base, forex.currencies)
        .then(fx => {
            let result = {
                base: fx.base,
                date: fx.date,
                rates: {},
                _metadata: { self: req.originalUrl }
            };
            forex.currencies.forEach(c => {
                result.rates[c] = fx.rates[c];
            });
            result.rates[base] = 1;
            res
                .status(200)
                .send(result)
                .end();
        })
        .catch(res.sendError);
});


module.exports = app;
