'use strict';

var server = require('./server');
var morgan = require('morgan');
var port = process.env.PORT || 3000;

server.use(morgan('dev')); // log requests to the console
server.listen(port, function () {
    console.log('ecom API server running on port %d', port);
});
