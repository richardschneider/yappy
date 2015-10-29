'use strict';

var ObjectId = require('mongodb').ObjectID;
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
    var db = model.media.db;
    var gs = db.gridStore(ObjectId(req.params.id), 'r');
    gs.open(function (e, gs) {
        if (e) return res.status(404).send(e).end();
        
        res
            .status(200)
            .set('content-type', gs.contentType)
            .set('content-md5', new Buffer(gs.md5, 'hex').toString('base64'))

        gs.stream().pipe(res);
    });
});


module.exports = router;