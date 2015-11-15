'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var cache = require('cache-control');
//var morgan = require('morgan');
var sally = require('sally-js');
var compression = require('compression');
var locale = require('locale');
require('../promises');

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
app.use(require('./send-error'));
app.use(function(err, req, res, next) {
  // Do logging and user-friendly error message display
  console.error(err);
  res.sendError(500, err);
});

locale.Locale['default'] = 'en'; // Cloud9 sets LANGUAGE to C
app.use(locale(['en', 'fr', 'zh']));
app.set('json spaces', 2);

app.get('/api', function(req, res) {
    res.json({ message: 'Welcome to the e-commerce API!' });
});

app.use(require('./multi-tenancy'));
app.use(require('./metadata'));
app.use(require('./upgrade'));
app.use('/api', require('./media'));
app.use('/api', require('./crud'));
app.use('/api-test', require('./api-test'));


module.exports = app;
