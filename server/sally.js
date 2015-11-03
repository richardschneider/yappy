'use strict';

var crypto = require('crypto');
var onFinished = require('on-finished');
var os = require('os');
const util = require('util');
const EventEmitter = require('events').EventEmitter;

var config = {};
var noDigest;

function Sally(opts) {
    // Initialize necessary properties from `EventEmitter` in this instance
    EventEmitter.call(this);

    opts = opts || {};
    config.hash = opts.hash || 'sha256';
    config.secret = opts.secret || 'this is not a secure secret';
    config.auditMethods = opts.auditMethods || ['POST', 'PUT', 'DELETE', 'PATCH'];
    config.user = opts.user || function() { return 'anonymous'; };
    config.hostname = opts.hostname || os.hostname();

    noDigest = crypto.createHmac(config.hash, config.secret)
        .update('')
        .digest('base64');
    
    return this;
}
util.inherits(Sally, EventEmitter);

var self = module.exports = new Sally();

self.logger = function (req, res, next){
    var now = new Date();

    function logRequest()
    {
        var ok = 200 <= res.statusCode && res.statusCode <= 400;
        if (ok && config.auditMethods.indexOf(req.method) < 0)
            return;
            
        var audit = {
            who: config.user(req),
            when: now.toISOString(),
            where: {
                client: req.ip
                    || req._remoteAddress
                    || (req.connection && req.connection.remoteAddress)
                    || undefined,
                server: config.hostname
                },
            why: req.method,
            what: (req.method == 'POST') ? res.header['Location'] : req.url,
            status: res.statusCode,
        };
        var digest = self.sign(audit);
        self.emit("log", audit, digest);
    }
    
    onFinished(res, logRequest);
    next();
};

self.sign = function (audit, prevDigest) {
    if (typeof audit === 'object')
        audit = JSON.stringify(audit);
    if (!prevDigest)
        prevDigest = noDigest;
        
    return crypto.createHmac(config.hash, config.secret)
        .update(audit)
        .update(prevDigest)
        .digest('base64');
};

self.verify = function (audit, digest, prevDigest) {
    return digest == self.sign(audit, prevDigest);
};

