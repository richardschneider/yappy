'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var mongoskin = require('mongoskin');
var cache = require('cache-control');
var morgan = require('morgan');
var model = require('./model');

var app = express();
//app.use(morgan('dev')); // log requests to the console
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cache({
    '/**': false // Default is no caching
}));

var mongodbUri = 'mongodb://demo:demo@ds051838.mongolab.com:51838/ecom';
//mongodbUri = 'mongodb://@127.0.0.1:27017/test';
var db = mongoskin.db(mongodbUri, {native_parser:true});

app.get('/api', function(req, res) {
    res.json({ message: 'Welcome to the e-commerce API!' });
});


app.param('collectionName', function(req, res, next, collectionName){
    if (model.names.indexOf(collectionName) < 0)
        return res.status(400).json({ message: 'Unknown model name.'});
    
    req.collection = db.collection(collectionName);
    return next();
});

app.get('/api/:collectionName', function(req, res, next) {
  req.collection.find({} ,{limit: 10, sort: {'_id': -1}}).toArray(function(e, results){
    if (e) return next(e);
    res.send(results);
  });
});

app.post('/api/:collectionName', function(req, res, next) {
    req.body.modifiedOn = new Date().toISOString();
    req.collection.insert(req.body, {}, function(e, results){
    if (e) return next(e);
    
    var id = results.insertedIds[0];
    res
        .status(201)
        .location(req.params.collectionName + '/' + id)
        .end();
  })
})

app.get('/api/:collectionName/:id', function(req, res, next) {
  req.collection.findById(req.params.id, function(e, result){
    if (e) return next(e)
    res.send(result)
  })
})

app.put('/api/:collectionName/:id', function(req, res, next) {
    req.body.modifiedOn = new Date().toISOString();
  req.collection.updateById(req.params.id, {$set: req.body}, {safe: true, multi: false}, function(e, result){
    if (e) return next(e)
    res.send((result === 1) ? {msg:'success'} : {msg: 'error'})
  })
})

app.delete('/api/:collectionName/:id', function(req, res, next) {
  req.collection.removeById(req.params.id, function(e, result){
    if (e) return next(e)
    res.send((result === 1)?{msg: 'success'} : {msg: 'error'})
  })
})

module.exports = app;
