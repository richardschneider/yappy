'use strict';

require('../promises');

var fs = require("fs");
var path = require('path');
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

let defaults = { 
    db: 'standard', 
    readOnly: false,
    tenantWide: false,
    upgrade: r => r,
    validate: anyValidate 
};

let model = 
fs.readdirAsync('./lib/model/resource')
.map(filename => {
    let r = path.basename(filename, '.js');
    var meta = require('./resource/' + r);
    var meta = extend(extend({name: r}, defaults), meta);
    meta.db = dbs[meta.db];
    meta.collectionName = meta.collectionName || meta.name;
    meta.collection = () => meta.db.collection(meta.collectionName);
    return meta;
})
.reduce((model, meta) => { 
    model[meta.name] = meta; 
    return model; 
}, {});

module.exports = model;