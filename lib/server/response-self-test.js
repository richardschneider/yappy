'use strict';

let should = require('should');

function failed(ctx, e) {
    let error = {
        message: e.message,
        details: {
            request: {
                method: ctx.req.method,
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
    ctx.res.status(500);
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
    if (ctx.statusCode == 204) return;
    should.exist(ctx.body, 'missing body');

    if (isJson(ctx)) {
        ctx.body.should.have.property('_metadata');
        ctx.body._metadata.should.have.property('self');
    }
//     should have last-modified header for json response
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
            ;//successfulResponse(ctx);
        else
            errorResponse(ctx);
        
        return ctx.body;
    } catch (e) {
        failed(ctx, e);
    }

    
}
function selftest(req, res, next) {
    // monkey patch res.send to add metadata.
    let send = res.send;
    res.send = function (body) {
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