"use strict";

var jsonApi = require("jsonapi-server");
var fs = require("fs");
var path = require("path");

jsonApi.setConfig({
  base: "api",
  meta: {
    copyright: "ecom by me"
  }
});

fs.readdirSync(path.join(__dirname, "/resource")).filter(function(filename) {
  return /^[a-z].*\.js$/.test(filename);
}).map(function(filename) {
  return path.join(__dirname, "/resource/", filename);
}).map(function(filename) {
    console.log("loading " + filename);
    return filename;
}).forEach(require);

jsonApi.onUncaughtException(function(request, error) {
  var errorDetails = error.stack.split("\n");
  console.error(JSON.stringify({
    request: request,
    error: errorDetails.shift(),
    stack: errorDetails
  }));
});

jsonApi.start();

module.exports = jsonApi.express;



// 'use strict';

// var express = require('express');
// var bodyParser = require('body-parser');
// var mongoskin = require('mongoskin');
// var cache = require('cache-control');
// var morgan = require('morgan');
// var compression = require('compression');
// var model = require('./model');

// var app = express();
// //app.use(morgan('dev')); // log requests to the console
// app.use(compression());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(cache({
//     '/api/media/*/content': 'max-stale=31536000', // media views are indempotent
//     '/**': false // Default is no caching
// }));
// app.set('json spaces', 2);

// app.get('/api', function(req, res) {
//     res.json({ message: 'Welcome to the e-commerce API!' });
// });

// app.use('/api', require('./media'));

// app.param('collectionName', function(req, res, next, collectionName){
//     var dataModel = model[collectionName];
//     if (!dataModel)
//         return res.status(400).json({ message: 'Unknown model name.'});
    
//     var readonlyMethods = [ 'GET', 'HEAD' ];
//     if (dataModel.readOnly && readonlyMethods.indexOf(req.method) < 0)
//         return res.status(405).json({ message: 'Model is read only'});

//     req.dataModel = dataModel;
//     if (collectionName == 'media')
//         req.collection = dataModel.db.collection('fs.files');
//     else
//         req.collection = dataModel.db.collection(collectionName);
    
//     return next();
// });

// app.get('/api/:collectionName', function(req, res, next) {
//   req.collection.find({} ,{limit: 10, sort: {'_id': -1}}).toArray(function(e, results){
//     if (e) return next(e);
//     res.send(results).end();
//   });
// });

// app.post('/api/:collectionName', function(req, res, next) {
//     var now = new Date();
    
//     if (!req.dataModel.validate(req, res))
//         return;
    
//     req.body.modifiedOn = now.toISOString();
//     req.collection.insert(req.body, {}, function(e, results) {
//         if (e) return next(e);
    
//         var id = results.insertedIds[0];
//         var url = '/api/' + req.params.collectionName + '/' + id;
//         res
//             .status(201)
//             .location(url)
//             .set('Last-Modified', now.toUTCString())
//             .send({ status: 'ok', self: url})
//             .end();
//       });
// });

// app.get('/api/:collectionName/schema', function(req, res, next) {
//     var schema = req.dataModel.schema;
//     if (!schema)
//         return res.status(404).end();
        
//     res.send(schema.toJSON()).end();
// });

// app.get('/api/:collectionName/:id', function(req, res, next) {
//     req.collection.findById(req.params.id, function(e, entity) {
//         if (e) return next(e);
        
//         res
//             .set('Last-Modified', new Date(entity.modifiedOn).toUTCString())
//             .send(entity)
//             .end();
//     });
// });

// app.put('/api/:collectionName/:id', function(req, res, next) {
//     var now = new Date();

//     if (!req.dataModel.validate(req, res))
//         return;

//     req.body.modifiedOn = now.toISOString();
//     req.collection.updateById(req.params.id, {$set: req.body}, {safe: true, multi: false}, function(e, result){
//         if (e) return next(e);

//         res
//             .set('Last-Modified', now.toUTCString())
//             .send((result === 1) ? {status:'ok'} : {status: 'error'})
//             .end();
//     });
// });

// app.delete('/api/:collectionName/:id', function(req, res, next) {
//     req.collection.removeById(req.params.id, function (e, result) {
//     if (e) return next(e);
    
//     res
//         .status(204)
//         .end();
//   });
// });


// module.exports = app;
