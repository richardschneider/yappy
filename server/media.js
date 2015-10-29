'use strict';

var express = require('express');
var multer = require('multer');
var model = require('./model');
var storage = require('./multer-grid')('mongodb://demo:demo@ds051838.mongolab.com:51838/ecom');

var router = express.Router();
var upload = multer({ storage: storage });

router.post('/media', upload.single('media'), function (req, res)  {
    let file = req.gridfsEntry;
    res
        .status(201)
        .location('/api/view/' + file._id)
        .set('Last-Modified', file.uploadDate.toUTCString())
        .end();
});

router.get('/view/:id', function(req, res, next) {
    res
        .status(501)
        .end();
});


module.exports = router;