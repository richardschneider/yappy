'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var cache = require('cache-control');
//var morgan = require('morgan');
var sally = require('sally-js');
var compression = require('compression');
var model = require('../model');

var app = express();
app.use(sally.express({
    prefix: './logs/ecom-'
}));
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cache({
    '/api/media/*/content': 'max-stale=31536000', // media views are indempotent
    '/**': false // Default is no caching
}));
app.use(function (req, res, next) {
    if (!res) return next();
    
    res.sendError = function (status, message, details) {
      res.status(status).json({message: message, details: details}).end(); 
    };
    next();
});
app.set('json spaces', 2);

app.get('/api', function(req, res) {
    res.json({ message: 'Welcome to the e-commerce API!' });
});

app.use(require('./multi-tenancy'));
app.use('/api', require('./media'));
app.use('/api-test', require('./api-test'));

app.param('collectionName', function(req, res, next, collectionName){
    let dataModel = model[collectionName];
    if (!dataModel)
        return res.sendError(400, 'Unknown model name');
    
    // should only allow GET and HEAD for read-only models.
    let readonlyMethods = [ 'GET', 'HEAD' ];
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

app.get('/api/:collectionName', function(req, res, next) {
    req.collection.find(
    {
      tenantId: req.tenantId
    },
    {
      limit: 10, 
      sort: {'_id': -1}
    })
    .toArray(function(e, results){
        if (e) return next(e);
        res.send(results).end();
    });
});

app.post('/api/:collectionName', function(req, res, next) {
    var now = new Date();
    
    if (!req.dataModel.validate(req, res))
        return;
    
    req.body.modifiedOn = now.toISOString();
    req.body.tenantId = req.tenantId;
    req.collection.insert(req.body, {}, function(e, results) {
        if (e) return next(e);
    
        var id = results.insertedIds[0];
        var url = '/api/' + req.params.collectionName + '/' + id;
        res
            .status(201)
            .location(url)
            .set('Last-Modified', now.toUTCString())
            .send({ status: 'ok', self: url})
            .end();
      });
});

app.get('/api/:collectionName/schema', function(req, res, next) {
    var schema = req.dataModel.schema;
    if (!schema)
        return res.sendError(501, "Oh well, the schema seems missing");
        
    res.send(schema.toJSON()).end();
});

app.get('/api/:collectionName/:id', function(req, res, next) {
    req.collection.findById(req.params.id, function(e, entity) {
        if (e) return next(e);
        
        if (!entity || entity.tenantId != req.tenantId)
            return res.sendError(404, 'Not found');

        res
            .set('Last-Modified',
                new Date(entity.modifiedOn || entity.uploadDate).toUTCString())
            .send(entity)
            .end();
    });
});

app.put('/api/:collectionName/:id', function(req, res, next) {
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

app.delete('/api/:collectionName/:id', function(req, res, next) {
    req.collection.remove({
        _id: req.params.id,
        tenantId: req.tenantId
    }, { 
        single: true
    });

    res
        .status(204)
        .end();
});

module.exports = app;
