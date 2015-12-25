'use strict';

let Promise = require('bluebird');
let agent = require('superagent-promise')(require('superagent'), Promise);

// TODO: Get port # from the original request
// TODO: cannot be static!
var baseUrl;
var original;

/**
 * Request builder with same interface as superagent.
 * It is convenient to import this as `request` in place of superagent.
 */
let request = function(method, url) {
    return agent(method, baseUrl + url)
        .set('host', original.headers.host);
};

request.options = function(url) {
    return request('OPTIONS', url);
};

request.head = function(url, data) {
    var req = request('HEAD', url);
    if (data) {
      req.send(data);
    }
    return req;
};

request.get = function(url, data) {
    var req = request('GET', url);
    if (data) {
      req.query(data);
    }
    return req;
};

request.post = function(url, data) {
    var req = request('POST', url);
    if (data) {
      req.send(data);
}
return req;
};

request.put = function(url, data) {
    var req = request('PUT', url);
    if (data) {
      req.send(data);
    }
    return req;
};

request.patch = function(url, data) {
    var req = request('PATCH', url);
    if (data) {
      req.send(data);
    }
    return req;
};

request.delete = function(url) {
    return request('DELETE', url);
};

module.exports = function (req) {
    original = req;
    let port = req.get('host').split(':')[1];
    baseUrl = `${req.protocol}://localhost:${port}`;
    return request;
};
