'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var cache = require('cache-control');

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cache({
    '/**': false // Default is no caching
}));

var db = require('./mongo');

var router = express.Router();
router.get('/', function(req, res) {
    res.json({ message: 'Welcome to the e-commerce API!' });
});

app.use('/api', router);
app.use('/api/bear', require('./model/bear'));

module.exports = app;
