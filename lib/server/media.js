'use strict';

var config = require('config');
var ObjectId = require('mongodb').ObjectID;
var express = require('express');
var multer = require('multer');
var model = require('../model');
var crud = require('./crud');
var authorisation = require('./authorisation');
var HttpError = require('node-http-error');

var storage = require('./multer-grid')(config.get('mediaDB.url'));

var router = express.Router();
var upload = multer({ storage: storage });

router.use(authorisation.demandResourceAccess());

router.post('/media', authorisation.demand('api:media:create'), upload.single('media'), function (req, res)  {
    model.then(model => {
        req.dataModel = model.media; // for middleware

        let file = req.gridfsEntry;
        let uploadDate = file.uploadDate.toUTCString();
        let resourceUrl = '/api/media/' + file._id;
        let contentUrl = resourceUrl + '/content';
        let body;
        if (req.prefer.return == 'representation') {
            body = req.dataModel.upgrade(file);
            body._metadata = {
                self: resourceUrl,
                type: 'media'
            };
        } else {
            body = { _metadata: { status: 'ok', self: contentUrl } };
        }
        res
            .status(201)
            .location(contentUrl)
            .set('Last-Modified', uploadDate)
            .send(body)
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
        var _id;
        try {
            _id = new ObjectId(req.params.id);
        }
        catch (e) {
            return next(new HttpError(404, e.message));
        }
        var gs = db.gridStore(_id, 'r');
        gs.open(function (e, gs) {
            if (e)
                return next(new HttpError(404, e.message));

            if (gs.metadata.tenantId != req.tenantId)
                return next(new HttpError(403, 'Access to other tenant data is not allowed'));

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
        var _id;
        try {
            _id = new ObjectId(req.params.id);
        }
        catch (e) {
            return next(new HttpError(404, e.message));
        }
        var gs = db.gridStore(_id, 'w');
          gs.open(function (e, gs) {
            if (e)
                return next(new HttpError(404, e.message));
            if (gs.metadata.tenantId != req.tenantId)
                return next(new HttpError(403, 'Access to other tenant data is not allowed'));

            gs.unlink(function (e) {
                if (e)
                    return next(new HttpError(404, e.message));
                res
                    .status(204)
                    .end();
            });
        });
    });
});

module.exports = router;
