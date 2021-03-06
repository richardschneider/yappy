'use strict';

/**
 * Intra-service requests.
 *
 * myself is a superagent client to the server withga headers configured from the original request.
 *
 * myself(req)
 *     .get('/api/tenant/123')
 *     .then(tentant => ...);
 */

let Promise = require('bluebird');
let agent = require('superagent-promise')(require('superagent'), Promise);

/**
 * Build a 'request' with same interface as superagent.
 */
function request_builder (req)
{
    let original = req;
    let port = req.get('host').split(':')[1];
    let baseUrl = `${req.protocol}://localhost:${port}`;

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

    return request;
}

module.exports = function (req) {
    return request_builder(req);
};
