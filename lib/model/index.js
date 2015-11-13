'use strict';

var Promise = require("bluebird");
var config = require('config');
var mongo = require('mongoskin');
var extend = require('util')._extend;

var dbs = {
    standard: mongo.db(config.get('standardDB.url'), config.get('standardDB.options')),
    sensitive : mongo.db(config.get('sensitiveDB.url'), config.get('sensitiveDB.options'))
};

var anyValidate = function(req, res, next)
{
    // cannot be empty
    if (Object.keys(req.body).length === 0)
        return res.sendError(422, 'Empty entity is not allowed');


    // validate against the schema
    var schema = req.dataModel.schema;
    if (schema) {
        var errors = schema.jpErrors(req.body);
        if (errors)
            return res.sendError(422, 'The supplied data is incorrect', errors);
    }
    
    return next ? next() : true;
};

var model = {};
let defaults = { 
    db: 'standard', 
    readOnly: false, 
    validate: anyValidate 
};

['bear', 'audit', 'media', 'tenant']
    .forEach (r => {
        var meta = require('./resource/' + r);
        var meta = extend(extend({}, defaults), meta);
        meta.db = dbs[meta.db];
        meta.collectionName = meta.collectionName || r;
        meta.collection = () => meta.db.collection(meta.collectionName);
        model[r] = meta;
    });

module.exports = Promise.resolve(model);