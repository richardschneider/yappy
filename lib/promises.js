'user strict';

// Promisify standard packages
var Promise = require("bluebird");
Promise.promisifyAll(require('mongoskin'));
Promise.promisifyAll(require("fs"));
