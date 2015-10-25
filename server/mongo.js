'use strict';

// Exports the mongoose connection to the Mongo database.

var mongoose = require('mongoose');
var mongodbUri = 'mongodb://demo:demo@ds051838.mongolab.com:51838/ecom';
//mongodbUri = 'mongodb://127.0.0.1/test';
mongoose.connect(mongodbUri);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

module.exports = db;
