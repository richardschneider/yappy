'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var cache = require('cache-control');
//var morgan = require('morgan');
var sally = require('sally-js');
var compression = require('compression');
var config = require('config')
require('../promises');

var app = express();

// ring 1 - sally Secure audit logging
app.use(sally.express({
    prefix: './logs/ecom-'
}));

// ring 2 - express Standard express request/response middleware (compression, bodyParser, ...)
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: config.get('jsonContentType') }));
app.use(cache({
    '/api/media/*/content': 'max-stale=31536000', // media views are indempotent
    '/**': false // Default is no caching
}));
app.use(require('./response-self-test'));
app.use(require('./send-error'));
app.use(require('express-prefer'));
app.use(function(err, req, res, next) {
  // Do logging and user-friendly error message display
  console.error(err);
  res.sendError(500, err);
});

app.set('json spaces', 2);

app.get('/api', function(req, res) {
    res.json({ message: 'Welcome to the e-commerce API!' });
});

// ring 3 - multi-tenancy Determines the tenant based on the URL and prevents returning other tenant's data

app.use(require('./multi-tenancy'));

// ring 4 - mung Resource/document transformation
app.use(require('./redact'));
app.use(require('./metadata'));
app.use(require('./upgrade'));

// ring 4 mini applications (plug-ins)
app.use('/api', require('./media'));
app.use('/api', require('./crud'));
app.use('/forex', require('./forex'));
app.use('/api-test', require('./api-test'));

module.exports = app;
