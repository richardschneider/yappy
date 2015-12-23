'use strict';

let should = require('should'),
    model = require('../model'),
    peers = require('../pubsub');

function failed(ctx, e) {
    let error = {
        message: e.message,
        details: {
            request: {
                method: ctx.req.method,
                host: ctx.req.headers.host,
                url: ctx.req.originalUrl,
            },
            reason: e,
            original: {
                status: ctx.statusCode,
                'content-type': ctx.res.get('content-type'),
                content: ctx.body
            }
        }
    };
    e.message = undefined;
    peers.publish('/yappy/error/server', error);

    ctx.res.status(500);
    ctx.res.set('content-language', 'en'); // todo l10n
    throw error;
}

function isJson(ctx) {
    let contentType = ctx.res.get('content-type');
    if (!contentType && typeof ctx.body === 'object')
        return true;
    return /^application\/.*json/.test(contentType);
}

function successfulResponse(ctx)
{
    ctx.req.user.permissionsChecked.should.equal(true, 'user permissions to the resource were not checked');

    if (ctx.statusCode == 204) return;

    should.exist(ctx.res.get('last-modified'), 'missing last-modified header');
    should.exist(ctx.body, 'missing body');

    if (ctx.statusCode == 201)
        should.exist(ctx.res.get('location'), 'missing location header');

    // TODO This has to be reworked.  Need a mechanism to determine if the response
    // is a full full resource or contains a list of resources.  The '?only' feature which
    // returns partial resource(s) break this self
    // if (isJson(ctx)) {
    //     let content = ctx.body.data || (Array.isArray(ctx.body) ? ctx.body : [ctx.body]);
    //     for (let resource of content) {
    //         should.exist(resource, 'null content is evil');
    //         should.exist(resource._metadata, 'missing _metadata');
    //         should.exist(resource._metadata.self, 'missing _metadata.self');
    //     }
    //     if (ctx.req.tenant.httpResponse.validateResource)
    //     {
    //         model.validate(ctx.body, null, ctx.res.get('content-type'));
    //     }
    // }

}

function errorResponse(ctx) {
    isJson(ctx).should.equal(true, 'error must return JSON content');
    should.exist(ctx.res.get('content-language'), 'missing content-language header');
    should.exist(ctx.body, 'missing error content');
    ctx.body.should.have.property('message');
    ctx.body.should.have.property('details');
}

function validate(ctx) {
    try {
        should.exist(ctx.req);
        should.exist(ctx.res);
        if (ctx.statusCode < 400)
            successfulResponse(ctx);
        else
            errorResponse(ctx);

        return ctx.body;
    } catch (e) {
        failed(ctx, e);
    }


}
function selftest(req, res, next) {
    return next(); // TODO
    // monkey patch res.send to add metadata.
    let send = res.send;
    res.send = function (body) {
        if (!req.tenant.httpResponse.validateResponse)
            return send.call(this, body);

        let ctx = {
            req: req,
            res: res,
            body: body,
            statusCode: res.statusCode
        };

        try {
            if (isJson(ctx) && typeof body === 'string') {
                try {
                    ctx.body = JSON.parse(body);
                }
                catch (e) { failed(ctx, e) }
            }
            validate(ctx);
            return send.call(this, body);
        }
        catch (e) {
            return send.call(this, e);
        }
    };

    next();
}

module.exports = selftest;