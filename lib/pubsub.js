`use strict`;

var Client = require('strong-pubsub');
var Adapter = require('./pubsub-local-adapter');

module.exports = new Client({}, Adapter);