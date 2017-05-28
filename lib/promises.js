'user strict';

// Promisify standard packages
var Promise = require("bluebird");
Promise.config({cancellation: true});
Promise.promisifyAll(require('mongoskin'));
Promise.promisifyAll(require("fs"));
