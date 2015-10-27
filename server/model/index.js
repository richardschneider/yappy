'use strict';

var mongo = require('mongoskin');

var standard  = mongo.db('mongodb://demo:demo@ds051838.mongolab.com:51838/ecom', {native_parser:true});
var sensitive = mongo.db('mongodb://demo:demo@ds051838.mongolab.com:51838/ecom', {native_parser:true});

var anyValidate = function(req, res, next)
{
    return next ? next() : true;
};

var model = {
    bear: { db: standard, readOnly: false, validate: anyValidate },
    vendor: { db: standard, readOnly: false, validate: anyValidate },
    product: { db: standard, readOnly: false, validate: anyValidate },
    
    audit: { db: sensitive, readOnly: true, validate: anyValidate }
};

module.exports = model;
