'use strict';

var config = require('config');
var ObjectId = require('mongodb').ObjectID;
var express = require('express');
var multer = require('multer');
var model = require('../model');
var crud = require('./crud');
var authorisation = require('./authorisation');

var storage = require('./multer-grid')(config.get('mediaDB.url'));

var router = express.Router();
var upload = multer({ storage: storage });

router.use(authorisation.allowsResourceAccess());

router.post('/media', authorisation.allows('api:media:create'), upload.single('media'), function (req, res)  {
    model.then(model => {
        req.dataModel = model.media; // for middleware

        let file = req.gridfsEntry;
        let url = '/api/media/' + file._id + '/content';
        res
            .status(201)
            .location(url)
            .set('Last-Modified', file.uploadDate.toUTCString())
            .send(req.prefer.return == 'representation'
                ? req.dataModel.upgrade(file)
                : { _metadata: { status: 'ok', self: url } })
            .end();
    });
});

router.get('/media', function(req, res, next) {
    return crud.handle(req, res, next);
});

router.get('/media/:id', function(req, res, next) {
    return crud.handle(req, res, next);
});

router.get('/media/:id/content', function(req, res, next) {
    model.then(model => {
        req.dataModel = model.media; // for middleware
        var db = model.media.db;
        var gs = db.gridStore(ObjectId(req.params.id), 'r');
        gs.open(function (e, gs) {
            if (e)
                return res.sendError(404, e);
            if (gs.metadata.tenantId != req.tenantId)
                return res.sendError(403, 'Access to other tenant data is not allowed');

            res
                .status(200)
                .set('content-type', gs.contentType)
                .set('content-md5', new Buffer(gs.md5, 'hex').toString('base64'))
                .set('last-modified', new Date(gs.uploadDate).toUTCString());

            gs.stream().pipe(res);
        });
    });
});

router.delete('/media/:id/content', function(req, res, next) {
    model.then(model => {
        req.dataModel = model.media; // for middleware
        var db = model.media.db;
        var gs = db.gridStore(ObjectId(req.params.id), 'r');
        gs.open(function (e, gs) {
            if (e)
                return res.sendError(404, e);
            if (gs.metadata.tenantId != req.tenantId)
                return res.sendError(403, 'Access to other tenant data is not allowed');

            gs.unlink(function (e, gs) {
                if (e)
                    return res.sendError(404, e);
                res
                    .status(204)
                    .end();
            });
        });
    });
});

module.exports = router;