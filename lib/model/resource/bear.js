'use strict';

var schema = require('js-schema-6901');
var text = require('../text');
var extend = require('util')._extend;

var defaults = {
    likes: ['honey']    
};

module.exports = {
    schema: schema('Not the drinking kind.', {
        name: Array.of(text),
        likes: Array.of(String)
    }),
    upgrade: r => extend(extend({}, defaults), r)
};

