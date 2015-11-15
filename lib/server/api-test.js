'use strict';

var express = require('express');
var router = express.Router();
var randomstring = require('randomstring');

router.get('/random', function (req, res, next) {
    res
        .status(200)
        .send(randomstring.generate({
            length: 16 * 1024,
            charset: 'alphabetic'
        }))
        .end();
});

router.get('/error/:msg?', function (req, res, next) {
    res.sendError(new Error(req.params.msg || 'this is an error message'));
});

module.exports = router;
