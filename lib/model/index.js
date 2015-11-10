'use strict';

var config = require('config');
var mongo = require('mongoskin');

var standard = mongo.db(config.get('standardDB.url'), config.get('standardDB.options'));
var sensitive = mongo.db(config.get('sensitiveDB.url'), config.get('sensitiveDB.options'));

var anyValidate = function(req, res, next)
{
    // cannot be empty
    if (Object.keys(req.body).length === 0)
        return res.status(422).send('Empty entity is not allowed').end();

    // validate against the schema
    var schema = req.dataModel.schema;
    if (schema) {
        var errors = schema.errors(req.body);
        if (errors)
            return res.status(422).send(errors).end();
    }
    
    return next ? next() : true;
};

var model = {
    bear: { db: standard, readOnly: false, validate: anyValidate, schema: require("./bear") },
    media: { db: standard, readOnly: true, validate: anyValidate },
    product: { db: standard, readOnly: false, validate: anyValidate },
    vendor: { db: standard, readOnly: false, validate: anyValidate },
    
    audit: { db: sensitive, readOnly: true, validate: anyValidate, schema: require('./audit') }
};

module.exports = model;
