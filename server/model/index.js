'use strict';

var mongo = require('mongoskin');

var standard  = mongo.db('mongodb://demo:demo@ds051838.mongolab.com:51838/ecom', {native_parser:true});
var sensitive = mongo.db('mongodb://demo:demo@ds051838.mongolab.com:51838/ecom', {native_parser:true});

var model = {
    bear: { db: standard, readOnly: false },
    vendor: { db: standard, readOnly: false },
    product: { db: standard, readOnly: false },
    
    audit: { db: sensitive, readOnly: true }
};

module.exports = model;
