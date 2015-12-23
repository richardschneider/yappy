'use strict';

let express = require('express'),
    randomstring = require('randomstring'),
    myself = require('./myself'),
    authz = require('./authorisation');

let app = express();

app.use(authz.demand('api-test:use'));

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
    next(new Error(req.params.msg || 'this is an error message'));
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

app.get('/never', authz.demand('never-ever-view-this-info'), (res, req, next) => {
    throw new Error('This should never happen!  authorization.demand is not working.');
});

module.exports = app;
