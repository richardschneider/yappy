'use strict';

var Joi = require('joi');

var schema = Joi.object({
    code: Joi.string().regex(/^[A-Z]{3}$/).required()
        .description('ISO 4217 currency code.')
        .example('NZD'),
    amount: Joi.string().regex(/^\d+(\.\d{1,4})?$/).required()
        .description('The value.')
        .example('123')
});

module.exports = schema

