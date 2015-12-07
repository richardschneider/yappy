'use strict';

require('should');
let mung = require('../lib/server/mung');

describe('mung', function () {

    it('should only process a resource', done => {
        let req = {},
            res = { headers: {'content-type': 'text/plain; charset="utf-8"'} },
            next = () => null;
        let expected = new Buffer('not a resource');
        res.end = actual => {
            actual.should.equal(expected);
            done();
        };
        mung(req, res, next);
        res.end(expected);
    });

    it('should send the transformed resource', done => {
        let req = {},
            res = { headers: {'content-type': 'application/json; charset="utf-8"'} },
            next = () => null;
        let resource = new Buffer(JSON.stringify({
            _metadata: {
                self: '/api/x/123',
                type: 'x'
            }
        }));
        let expected = {
            a: 'a',
            _metadata: {
                self: '/api/x/123',
                type: 'x'
            }
        };
        res.end = actual => {
            JSON.parse(actual.toString()).should.eql(expected);
            done();
        };
        mung(req, res, next);
        res.mung((r, req, res) => {
            r.a = 'a';
        });
        res.end(resource);
    });

    it('should process a list of resources by transforming one resource at a time', done => {
        let req = {},
            res = { headers: {'content-type': 'application/json; charset="utf-8"'} },
            next = () => null;
        let resources = new Buffer(JSON.stringify({
            data: [
                {
                    _metadata: {
                        self: '/api/x/1',
                        type: 'x'
                    }
                },
                {
                    _metadata: {
                        self: '/api/x/2',
                        type: 'x'
                    }
                }
            ]
        }));
        let expected = {
            data: [
                {
                    a: 'a',
                    _metadata: {
                        self: '/api/x/1',
                        type: 'x'
                    }
                },
                {
                    a: 'a',
                    _metadata: {
                        self: '/api/x/2',
                        type: 'x'
                    }
                }
            ]
        };
        res.end = actual => {
            JSON.parse(actual.toString()).should.eql(expected);
            done();
        };
        mung(req, res, next);
        res.mung((r, req, res) => {
            r.a = 'a';
        });
        res.end(resources);
    });

    it('should apply transformations in LIFO order', done => {
        let req = {},
            res = { headers: {'content-type': 'application/json; charset="utf-8"'} },
            next = () => null;
        let resources = new Buffer(JSON.stringify({
            data: [
                {
                    _metadata: {
                        self: '/api/x/1',
                        type: 'x'
                    }
                },
                {
                    _metadata: {
                        self: '/api/x/2',
                        type: 'x'
                    }
                }
            ]
        }));
        let expected = {
            data: [
                {
                    a: 'ab',
                    _metadata: {
                        self: '/api/x/1',
                        type: 'x'
                    }
                },
                {
                    a: 'ab',
                    _metadata: {
                        self: '/api/x/2',
                        type: 'x'
                    }
                }
            ]
        };
        res.end = actual => {
            JSON.parse(actual.toString()).should.eql(expected);
            done();
        };
        mung(req, res, next);
        res.mung((r, req, res) => {
            r.a += 'b';
        });
        res.mung((r, req, res) => {
            r.a = 'a';
        });
        res.end(resources);
    });

    it('should send 204 No Content when the resource is removed', done => {
        let req = {},
            res = { headers: {'content-type': 'application/json; charset="utf-8"'} },
            next = () => null,
            statusCode = 0;
        res.status = status => { statusCode = status; return res; };
        let resource = new Buffer(JSON.stringify({
            _metadata: {
                self: '/api/x/123',
                type: 'x'
            }
        }));
        res.end = actual => null;
        mung(req, res, next);
        res.mung((r, req, res) => null);
        res.end(resource);
        statusCode.should.equal(204);
        done();
    });

    it('should send empty data when all resources are removed', done => {
        let req = {},
            res = { headers: {'content-type': 'application/json; charset="utf-8"'} },
            next = () => null;
        let resources = new Buffer(JSON.stringify({
            data: [
                {
                    _metadata: {
                        self: '/api/x/1',
                        type: 'x'
                    }
                },
                {
                    _metadata: {
                        self: '/api/x/2',
                        type: 'x'
                    }
                }
            ]
        }));
        let expected = { data: [] };
        res.end = actual => {
            JSON.parse(actual.toString()).should.eql(expected);
            done();
        };
        mung(req, res, next);
        res.mung((r, req, res) => null);
        res.end(resources);
    });

    it('should abort when end is called', done => {
        let req = {},
            res = { headers: {'content-type': 'application/json; charset="utf-8"'} },
            next = () => null;
        let resource = new Buffer(JSON.stringify({
            _metadata: {
                self: '/api/x/123',
                type: 'x'
            }
        }));
        let expected = new Buffer('some message');
        res.end = actual => {
            actual.should.equal(expected);
            done();
        };
        mung(req, res, next);
        res.mung((r, req, res) => {
            res.end(expected);
        });
        res.end(resource);
    });


});
