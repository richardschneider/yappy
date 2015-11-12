'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var cache = require('cache-control');
//var morgan = require('morgan');
var sally = require('sally-js');
var compression = require('compression');

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
app.use('/api', require('./crud'));
app.use('/api-test', require('./api-test'));

// Mongoskin as promised.
var Promise = require("bluebird");
var mongoskin = require("mongoskin");
Object.keys(mongoskin).forEach(function(key) {
  var value = mongoskin[key];
  if (typeof value === "function") {
    Promise.promisifyAll(value);
    Promise.promisifyAll(value.prototype);
  }
});
Promise.promisifyAll(mongoskin);


module.exports = app;
