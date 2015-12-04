'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var cache = require('cache-control');
//var morgan = require('morgan');
var sally = require('sally-js');
var compression = require('compression');
var config = require('config')
require('../promises');
var authorisation = require('./authorisation');

var app = express();

// ring 1 - sally Secure audit logging
app.use(sally.express({
    user: req => req.user.email,
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

app.set('json spaces', 2);

// ring 3 - security
app.use(require('./mung')); // place at ring 3 so that multi-tenancy can hook in.
app.use(require('./multi-tenancy'));
app.use(require('./authentication'));
app.use(authorisation);

// ring 4 - mung resource/document transformation
app.use(require('./redact'));
app.use(require('./only'));
app.use(require('./resource-check'));
app.use(require('./metadata'));
app.use(require('./upgrade'));

// ring 5 mini applications (plug-ins)
app.get('/api', authorisation.demand('public:view'), function (req, res) {
    res
        .set('last-modified', new Date('1957-08-13').toUTCString())
        .json({
            message: 'Welcome to the e-commerce API!',
            _metadata: { self: req.originalUrl }
        });
});
app.get('/api/whoami', authorisation.demand('public:view'), function(req, res) {
    res
        .set('last-modified', new Date().toUTCString())
        .send(req.user)
        .end();
});

app.use('/api', require('./media'));
app.use('/api', require('./crud'));
app.use('/forex', require('./forex'));
app.use('/api-test', require('./api-test'));

// should be last in line
app.use(function(err, req, res, next) {
  res.sendError(err);
});

module.exports = app;
