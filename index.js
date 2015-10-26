'use strict';

var server = require('./server');
var ip = process.env.IP || 'http://localhost';
var port = process.env.PORT || 3000;

server.listen(port, function () {
    console.log('e-Commerce server @ %s:%d/api', ip, port);
});
