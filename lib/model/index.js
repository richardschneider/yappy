'use strict';

require('../promises');

let fs = require("fs"),
    config = require('config'),
    path = require('path'),
    mongo = require('mongoskin'),
    schema = require('js-schema-6901'),
    extend = require('util')._extend;

let dbs = {
    standard: mongo.db(config.get('standardDB.url'), config.get('standardDB.options')),
    sensitive : mongo.db(config.get('sensitiveDB.url'), config.get('sensitiveDB.options'))
};

//let jsonSchema = schema.fromJS(require('./json-schema'));

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

/*
 * A promise to find all the resource models.
 */
let model =
    fs.readdirAsync('./lib/model/resource')
    .map(filename => {
        let r = path.basename(filename, '.js');
        let meta = require('./resource/' + r);
        meta = extend(extend({name: r}, defaults), meta);
        meta.db = dbs[meta.db];
        meta.collectionName = meta.collectionName || meta.name;
        meta.collection = () => meta.db.collection(meta.collectionName);
        return meta;
    })
    .reduce((model, meta) => {
        model[meta.name] = meta;
        return model;
    }, {});

/*
 * Validate a resource, or list resources, against its schema.
 */
model.validate = (resource, type, contentType, opts) => {
    if (Array.isArray(resource)) {
        let opts = {
            prefix: '/',
            delimiter: '/'
        };
        let error = new Error('');
        for (let i=0; i < resource.length; ++i) {
            opts.prefix = `/${i}/`;
            try {
                model.validate(resource[i], type, contentType, opts);
            } catch (e) {
                error = extend(error, e);
                error.message = e.message;
            }
        }
        if (error.message != '')
            throw error;
        return;
    }

    // find a schema to use for validation.
    var schema;
    type = type || (resource._metadata ? resource._metadata.type : undefined);

    if (contentType == 'application/schema+json') {
        // https://github.com/richardschneider/ecom/issues/99
        return; //schema = jsonSchema;
    } else {
        if (!type) {
            return;
        }

        let dataModel = model.value()[type];
        schema = dataModel ? dataModel.schema : undefined;

        // Maybe its not a resource, but is still modelled.
        if (!schema) {
            try { schema = require(`./${type}`) }
            catch (e) { console.log(`failed to find ${type} schema`) } // eat it
        }
    }

    // validate and throw any errors.
    if (schema) {
        let errors = schema.jpErrors(resource, opts);
        if (errors) {
            let e = new Error('schema validation failed');
            throw extend(e, errors);
        }
    }
};

module.exports = model;
