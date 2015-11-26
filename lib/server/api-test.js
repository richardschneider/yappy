'use strict';

let express = require('express');
let app = express();
let randomstring = require('randomstring');
let myself = require('./myself');

app.get('/random', function (req, res, next) {
    res
        .status(200)
        .set('last-modified', new Date().toUTCString())
        .send(randomstring.generate({
            length: 16 * 1024,
            charset: 'alphabetic'
        }))
        .end();
});

app.get('/error/:msg?', function (req, res, next) {
    res.sendError(new Error(req.params.msg || 'this is an error message'));
});

function eat(req, res, next) {
    let url = '/' + req.params.a;
    if (req.params.b)
        url += '/' + req.params.b;
    if (req.params.c)
        url += '/' + req.params.c;

    myself(req)
        .get(url)
        .then(r => res
            .set('last-modified', r.get('last-modified'))
            .status(r.status)
            .send(Object.keys(r.body).length !== 0 ? r.body : r.text)
            .end())
        .catch(res.sendError);
}

var env = process.env.NODE_ENV || 'development';
if ('production' != env) {
    app.get('/eat/:a/:b?/:c?', eat);
}

module.exports = app;
