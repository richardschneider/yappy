'use strict';

var Joi = require('joi');

var schema = Joi.object({
    tag: Joi.any().valid(['en', 'zh-TW', 'zh-CH']).required()
        .description('An IETF language tag.')
        .example('zh-CH'),
    text: Joi.string().required()
        .description('Some text in the specified language.')
        .example('Hello world')
});

module.exports = function() { return schema; }

