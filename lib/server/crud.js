'use strict';

var express = require('express');
var ObjectID = require('mongoskin').ObjectID;
var model = require('../model');
var app = express();
var peers = require('../pubsub');

let readonlyMethods = [ 'GET', 'HEAD' ];

app.param('collectionName', function(req, res, next, collectionName){
    model.then(model => {
        let dataModel = model[collectionName];
        if (!dataModel)
            return res.sendError(400, 'Unknown model name');
        
        // should only allow GET and HEAD for read-only models.
        if (dataModel.readOnly && readonlyMethods.indexOf(req.method) < 0)
            return res.sendError(405, 'Resource is read only');
    
        // set the mongoDB colletion.
        req.dataModel = dataModel;
        req.collection = dataModel.collection();
        
        return next();
    });
});

/*
 * get all the instances of the type.
 *
 * TODO: Paging
 */
app.get('/:collectionName', function(req, res, next) {
    var selector = {};
    if (!req.dataModel.tenantWide)
        selector.tenantId = req.tenantId;
    let options = {
        limit: 10, 
        sort: {'_id': -1}
    };
    req.collection
        .find(selector, options)
        .toArrayAsync()
        .map(doc => req.dataModel.upgrade(doc))
        .then(function (docs) {
            res.send(docs).end();
        })
        .catch(res.sendError);
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
            if (!entity || (!req.dataModel.tenantWide && entity.tenantId != req.tenantId))
                return res.sendError(404, 'Not found');
            
            entity = req.dataModel.upgrade(entity);
            res
                .set('Last-Modified',
                    new Date(entity.modifiedOn || entity.uploadDate).toUTCString())
                .send(entity)
                .end();
        })
        .catch(res.sendError);
});

/*
 * Create a new instance of the type.
 */
app.post('/:collectionName', function(req, res, next) {
    req.body = req.dataModel.upgrade(req.body);
    if (!req.dataModel.validate(req, res))
        return;
    
    let now = new Date();
    req.body.modifiedOn = now.toISOString();
    req.body.tenantId = req.tenantId;

    // Special hack for tenant.  The tenentID must be the _id for self
    // registration.
    if (req.dataModel.name === 'tenant') {
        let id = new ObjectID();
        req.body._id = id;
        req.body.tenantId = id.toHexString();
    }
    req.collection
        .insertAsync(req.body, {w: 1})
        .then(function (doc) {
            let id = doc.insertedIds[0];
            let url = '/api/' + req.params.collectionName + '/' + id;
            res
                .status(201)
                .location(url)
                .set('Last-Modified', now.toUTCString())
                .send({ status: 'ok', self: url})
                .end();
            peers.publish('/ecom/api/create/' + req.params.collectionName, url);
        })
        .catch(res.sendError);
});

app.put('/:collectionName/:id', function(req, res, next) {
    var now = new Date();

    req.body = req.dataModel.upgrade(req.body);
    if (!req.dataModel.validate(req, res))
        return;

    req.body.modifiedOn = now.toISOString();
    req.body.tenantId = req.tenantId;
    let selector = { 
        _id: ObjectIDorString(req.params.id),
        tenantId: req.tenantId
    };
    let options = { safe: true, multi: false };
    req.collection
        .updateAsync(selector, req.body, options)
        .then(result => {
            if (result.result.n != 1)
                return res.sendError(404, 'Not found');
            res
                .status(200)
                .set('Last-Modified', now.toUTCString())
                .end();
                peers.publish('/ecom/api/change/' + req.params.collectionName, req.originalUrl);
        })
        .catch(res.sendError);
});

app.delete('/:collectionName/:id', function(req, res, next) {
    let selector = {
        _id: ObjectIDorString(req.params.id),
        tenantId: req.tenantId
    };
    req.collection
        .removeAsync(selector, { justOne: true })
        .then(result => {
            if (result.result.n != 1)
                return res.sendError(404, 'Not found');

            peers.publish('/ecom/api/change/' + req.params.collectionName, req.originalUrl);
            peers.publish('/ecom/api/delete/' + req.params.collectionName, req.originalUrl);
            res.status(204).end();
        })
        .catch(res.sendError);
});

function ObjectIDorString(id)
{
    try {
        return new ObjectID(id);
    }
    catch (e) {
        return id;
    }
}
module.exports = app;
