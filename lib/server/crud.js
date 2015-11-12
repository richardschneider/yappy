'use strict';

var express = require('express');
var model = require('../model');
var app = express();

let readonlyMethods = [ 'GET', 'HEAD' ];
let deleteOptions = { single: true };

app.param('collectionName', function(req, res, next, collectionName){
    let dataModel = model[collectionName];
    if (!dataModel)
        return res.sendError(400, 'Unknown model name');
    
    // should only allow GET and HEAD for read-only models.
    if (dataModel.readOnly && readonlyMethods.indexOf(req.method) < 0)
        return res.sendError(405, 'Model is read only');

    // set the mongoDB colletion.
    req.dataModel = dataModel;
    if (collectionName == 'media')
        req.collection = dataModel.db.collection('fs.files');
    else
        req.collection = dataModel.db.collection(collectionName);
    
    return next();
});

/*
 * get all the instances of the type.
 *
 * TODO: Paging
 */
app.get('/:collectionName', function(req, res, next) {
    let selector = {
        tenantId: req.tenantId
    };
    let options = {
        limit: 10, 
        sort: {'_id': -1}
    };
    req.collection
        .find(selector, options)
        .toArrayAsync()
        .then(function (docs) {
            res.send(docs).end();
    });
});

/*
 * Get the schema for the type.
 */
app.get('/:collectionName/schema', function(req, res, next) {
    let schema = req.dataModel.schema;
    if (!schema)
        return res.sendError(501, "Oh well, the schema seems missing");
        
    res.json(schema).end();
});

/*
 * Get a specific instance of the type.
 */
app.get('/:collectionName/:id', function(req, res, next) {
    req.collection
        .findByIdAsync(req.params.id)
        .then(function (entity) {
            if (!entity || entity.tenantId != req.tenantId)
                return res.sendError(404, 'Not found');

            res
                .set('Last-Modified',
                    new Date(entity.modifiedOn || entity.uploadDate).toUTCString())
                .send(entity)
                .end();
    });
});

/*
 * Create a new instance of the type.
 */
app.post('/:collectionName', function(req, res, next) {
    if (!req.dataModel.validate(req, res))
        return;
    
    let now = new Date();
    req.body.modifiedOn = now.toISOString();
    req.body.tenantId = req.tenantId;
    req.collection
        .insertAsync(req.body, {})
        .then(function (doc) {
            let id = doc.insertedIds[0];
            let url = '/api/' + req.params.collectionName + '/' + id;
            res
                .status(201)
                .location(url)
                .set('Last-Modified', now.toUTCString())
                .send({ status: 'ok', self: url})
                .end();
        });
});

app.put('/:collectionName/:id', function(req, res, next) {
    var now = new Date();

    if (!req.dataModel.validate(req, res))
        return;

    req.body.modifiedOn = now.toISOString();
    req.body.tenantId = req.tenantId;
    let selector = { 
        _id: req.params.id,
        tenantId: req.tenantId
    };
    let options = { safe: true, multi: false };
    req.collection.update(selector, req.body, options, function(e, result){
        if (e) return next(e);

        res
            .status(200)
            .set('Last-Modified', now.toUTCString())
            .end();
    });
});

app.delete('/:collectionName/:id', function(req, res, next) {
    let selector = {
        _id: req.params.id,
        tenantId: req.tenantId
    };
    req.collection
        .removeAsync(selector, deleteOptions)
        .then(function() {
            res.status(204).end();
    });
});

module.exports = app;