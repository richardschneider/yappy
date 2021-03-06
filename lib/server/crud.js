'use strict';

var express = require('express');
var ObjectID = require('mongoskin').ObjectID;
var jsonpatch = require('fast-json-patch');
var model = require('../model');
var app = express();
var peers = require('../pubsub');
var qs = require('qs');
var extend = require('util')._extend;
var HttpError = require('node-http-error');

app.use(require('./authorisation').demandResourceAccess());

let readonlyMethods = [ 'GET', 'HEAD', 'OPTIONS' ];

app.param('collectionName', function(req, res, next, collectionName){
    model.then(model => {
        let dataModel = model[collectionName];
        if (!dataModel)
            return next(new HttpError(400, `Resource type '${collectionName}' is unknown`));

        // should only allow GET and HEAD for read-only models.
        if (dataModel.readOnly && readonlyMethods.indexOf(req.method) < 0)
            return next(new HttpError(405, 'Resource is read only'));

        // set the mongoDB colletion.
        req.dataModel = dataModel;
        req.collection = dataModel.collection();

        return next();
    });
});

/*
 * Searching utilities.
 */
function initSelector(req, selector) {
    selector = selector || {};
    if (!req.dataModel.tenantWide) {
        if (req.dataModel.name === 'media')
            selector['metadata.tenantId'] = req.tenantId;
        else
            selector.tenantId = req.tenantId;
    }
    return selector;
}

function initOptions(req, options) {
    options = options || {};

    // Paging options.
    let max = req.tenant.httpResponse.maxResources;
    options.limit = Math.min(parseInt(req.query.n, 10) || max, max);
    options.skip = parseInt(req.query.o, 10) || 0;

    // Sorting options.  The final sort param is _id to force a unique
    // order for paging.
    options.sort = (req.query.sort || '')
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length !== 0)
        .map(s => s.startsWith('-')
            ? [s.slice(1), 'desc']
            : [s, 'asc']);
    options.sort.push(['_id', 'asc']);

    return options;
}

function doQuery(req, res, selector, options) {
    if (req.query.explain) {
        req.dataModel = null; // prevent's metadata being added
        req.collection
            .find(selector, options)
            .explainAsync()
            .then (result => {
                result.query = selector;
                result.options = options;
                res
                    .set('last-modified', new Date().toUTCString())
                    .send(result)
                    .end();
            });
        return;
    }

    // Go fetch doggie.
    req.collection
        .find(selector, options)
        .toArrayAsync()
        .map(doc => req.dataModel.upgrade(doc))
        .then(function (docs) {

            // Result form.
            let result = {
                links: {
                    self: req.originalUrl
                },
                data: docs
            };

            // Paging links
            let qsopts = { indices: false, encode: false };
            if (true)
            {
                let q = extend({}, req.query);
                q.n = options.limit;
                q.o = 0;
                result.links.first = `${req.baseUrl}${req.path}?${qs.stringify(q, qsopts)}`;
            }
            if (options.limit <= docs.length)
            {
                let q = extend({}, req.query);
                q.n = options.limit;
                q.o = options.skip + options.limit;
                result.links.next = `${req.baseUrl}${req.path}?${qs.stringify(q, qsopts)}`;
            }
            if (options.skip !==  0) {
                let q = extend({}, req.query);
                q.n = options.limit;
                q.o = Math.max(0, options.skip - options.limit);
                result.links.prev = `${req.baseUrl}${req.path}?${qs.stringify(q, qsopts)}`;
            }

            // All done.
            res
                .set('last-modified', new Date().toUTCString())
                .send(result)
                .end();
        })
        // Assume a client error.
        .catch(e => res.sendError(400, e.message, { code: e.code, name: e.name}));
}

/*
 * filter the instances of the type.
 */
app.post('/:collectionName/find', function(req, res, next) {
    let selector = initSelector(req, req.body);
    let options = initOptions(req);
    doQuery (req, res, selector, options);
});

/*
 * get all the instances of the type.
 */
app.get('/:collectionName', function(req, res, next) {
    let selector = initSelector(req);
    let options = initOptions(req);
    doQuery (req, res, selector, options);
});

/*
 * Get the schema for the type.
 */
app.get('/:collectionName/schema', function(req, res, next) {
    let schema = req.dataModel.schema;
    if (!schema)
        return next(new HttpError(501, "Oh well, the schema seems missing"));

    schema = schema.toJSON();
    schema._metadata = schema._metadata || {};
    schema._metadata.self = req.originalUrl;
    res
        .set('last-modified', new Date().toUTCString()) // todo: date of the schema file
        .set('content-type', 'application/schema+json')
        .json(schema)
        .end();
});

/*
 * Get a specific instance of the type.
 */
app.get('/:collectionName/:id', function(req, res, next) {
    req.collection
        .findByIdAsync(req.params.id)
        .then(function (entity) {
            if (!entity)
                return next(new HttpError(404, 'Not found'));
            if (!req.dataModel.tenantWide && ((entity.tenantId || entity.metadata.tenantId) != req.tenantId))
                return next(new HttpError(403, 'Access to other tenant data is not allowed'));

            entity = req.dataModel.upgrade(entity);
            res
                .set('Last-Modified',
                    new Date(entity.modifiedOn).toUTCString())
                .send(entity)
                .end();
        })
        .catch(next);
});

/*
 * Create a new instance of the type.
 */
app.post('/:collectionName', function(req, res, next) {
    req.body = req.dataModel.upgrade(req.body);
    if (!req.dataModel.validate(req, res))
        return;

    let now = new Date();
    req.body.modifiedOn = now.toISOString();
    req.body.tenantId = req.tenantId;

    // Special hack for tenant.  The tenentID must be the _id for self
    // registration.
    if (req.dataModel.name === 'tenant') {
        let id = new ObjectID();
        req.body._id = id;
        req.body.tenantId = id.toHexString();
    }
    req.collection
        .insertAsync(req.body, {w: 1})
        .then(function (doc) {
            let id = doc.insertedIds[0];
            let url = '/api/' + req.params.collectionName + '/' + id;
            res
                .status(201)
                .location(url)
                .set('Last-Modified', now.toUTCString())
                .send(req.prefer.return == 'representation'
                    ? req.body
                    : { _metadata : { self: url, status: 'ok' }})
                .end();
            peers.publish('/yappy/api/create/' + req.params.collectionName, url);
        })
        .catch(next);
});

app.put('/:collectionName/:id', function(req, res, next) {
    var now = new Date();

    req.body = req.dataModel.upgrade(req.body);
    if (!req.dataModel.validate(req, res))
        return;

    req.body.modifiedOn = now.toISOString();
    req.body.tenantId = req.tenantId;
    let selector = {
        _id: ObjectIDorString(req.params.id),
        tenantId: req.tenantId
    };
    let options = { safe: true, multi: false };
    req.collection
        .updateAsync(selector, req.body, options)
        .then(result => {
            if (result.result.n != 1)
                return next(new HttpError(404, 'Not found'));

            res
                .location(req.originalUrl)
                .set('Last-Modified', now.toUTCString());
            if (req.prefer.return == 'representation')
                res.status(200).send(req.body).end();
            else
                res = res.status(204).end();
            peers.publish('/yappy/api/change/' + req.params.collectionName, req.originalUrl);
        })
        .catch(next);
});

/*
 * Modify parts of a resource.
 */
function jsonPatch(req, res, next) {
    req.collection
        .findByIdAsync(req.params.id)
        .then(entity => {
            if (!entity)
                return next(new HttpError(404, 'Not found'));

            // Appy the patch if its valid.
            entity = req.dataModel.upgrade(entity);
            let patch = req.body;
            let err = jsonpatch.validate(patch, entity);
            if (err) {
                let msg = err.message;
                err.message = err.tree = undefined;
                return res.sendError(422, msg, err);
            }
            jsonpatch.apply(entity, patch, true);

            // Now its just a simple PUT
            req.body = entity;
            req.method = 'PUT';
            return app.handle(req, res, next);
        })
        .catch(next);
}

function mongoPatch(req, res, next) {
    let now = new Date();
    res
        .status(501)
    //    .set('Last-Modified', now.toUTCString())
        .end();
    //peers.publish('/yappy/api/change/' + req.params.collectionName, req.originalUrl);
}

app.set('patchHandlers', {
    'application/json-patch+json': jsonPatch,
    'application/x.mongo-patch+json': mongoPatch
});

app.patch('/:collectionName/:id', function(req, res, next) {
    let contentType = req.get('content-type');
    let handler = app.get('patchHandlers')[contentType];
    if (!handler)
        return next(new HttpError(415, `PATCH document type '${contentType}' is unknown`));

    return handler(req, res, next);
});

app.delete('/:collectionName/:id', function(req, res, next) {
    let selector = {
        _id: ObjectIDorString(req.params.id),
        tenantId: req.tenantId
    };
    req.collection
        .removeAsync(selector, { justOne: true })
        .then(result => {
            if (result.result.n != 1)
                return next(new HttpError(404, 'Not found'));

            peers.publish('/yappy/api/change/' + req.params.collectionName, req.originalUrl);
            peers.publish('/yappy/api/delete/' + req.params.collectionName, req.originalUrl);
            res.status(204).end();
        })
        .catch(next);
});

function ObjectIDorString(id)
{
    try {
        return new ObjectID(id);
    }
    catch (e) {
        return id;
    }
}

module.exports = app;
