'use strict';

var config = require('config');
var ObjectId = require('mongodb').ObjectID;
var express = require('express');
var multer = require('multer');
var model = require('../model');
var storage = require('./multer-grid')(config.get('mediaDB.url'));

var router = express.Router();
var upload = multer({ storage: storage });

router.post('/media', upload.single('media'), function (req, res)  {
    let file = req.gridfsEntry;
    let url = '/api/media/' + file._id + '/content';
    res
        .status(201)
        .location(url)
        .set('Last-Modified', file.uploadDate.toUTCString())
        .send({ status: 'ok', self: url})
        .end();
});

router.get('/media', function(req, res, next) {
    model.media.db.collection('fs.files').find(
        {
          "metadata.tenantId": req.tenantId
        },
        {
          limit: 10, 
          sort: {'_id': -1}
          
        })
        .toArray(function(e, results){
            if (e) return next(e);
            res
                .send(results)
                .end();
        });
});

router.get('/media/:id', function(req, res, next) {
    model.media.db.collection('fs.files').findById(req.params.id, function(e, entity) {
        if (e) return next(e);
        
        if (!entity || entity.metadata.tenantId != req.tenantId)
            return res.sendError(404, 'Not found');

        res
            .set('Last-Modified',
                new Date(entity.uploadDate).toUTCString())
            .send(entity)
            .end();
    });
});

router.get('/media/:id/content', function(req, res, next) {
    var db = model.media.db;
    var gs = db.gridStore(ObjectId(req.params.id), 'r');
    gs.open(function (e, gs) {
        if (e) 
            return res.sendError(404, e);
        if (gs.metadata.tenantId != req.tenantId)
            return res.sendError(404, "Not found");
            
        res
            .status(200)
            .set('content-type', gs.contentType)
            .set('content-md5', new Buffer(gs.md5, 'hex').toString('base64'))
            .set('last-modified', new Date(gs.uploadDate).toUTCString());

        gs.stream().pipe(res);
    });
});

router.delete('/media/:id/content', function(req, res, next) {
    var db = model.media.db;
    var gs = db.gridStore(ObjectId(req.params.id), 'r');
    gs.unlink(function (e, gs) {
        if (e) return res.status(404).send(e).end();
        
        res
            .status(204)
            .end();
    });
});

module.exports = router;