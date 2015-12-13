'use strict';

let sap = require("supertest-as-promised"),
    methods = require('methods');

/**
 * Request builder with same interface as supertest.
 */
let request = function(app) {
    let req = sap(app);
    let original = {};

    methods.forEach(function(method){
        original[method] = req[method];
        req[method] = function(url) {
            return original[method](url)
                .set('accept', 'application/json')
                .auth('alice', 'xyzzy');
            };
    });

    // let sap_post = req.post;
    // req.post = (url) => {
    //     return sap_post(url)
    //         .auth('alice', 'xyzzy')
    // }

    return req;
};


module.exports = request;