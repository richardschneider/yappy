'use strict';

require('should');
let mung = require('../lib/server/mung-resources');

describe('mung', function () {

    // it('should only process a resource', done => {
    //     let req = {},
    //         res = { headers: {'content-type': 'text/plain; charset="utf-8"'} },
    //         next = () => null;
    //     let expected = new Buffer('not a resource');
    //     res.end = actual => {
    //         actual.should.equal(expected);
    //         done();
    //     };
    //     mung(req, res, next);
    //     res.end(expected);
    // });

    it('should send the transformed resource', done => {
        let req = {},
            res = { headers: {'content-type': 'application/json; charset="utf-8"'} },
            next = () => null;
        let resource = {
            _metadata: {
                self: '/api/x/123',
                type: 'x'
            }
        };
        let expected = {
            a: 'a',
            _metadata: {
                self: '/api/x/123',
                type: 'x'
            }
        };
        res.json = actual => {
            actual.should.eql(expected);
            done();
        };
        mung.resources((r, req, res) => {
            r.a = 'a';
        })(req, res);
        res.json(resource);
    });

    it('should process a list of resources by transforming one resource at a time', done => {
        let req = {},
            res = { headers: {'content-type': 'application/json; charset="utf-8"'} },
            next = () => null;
        let resources = {
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
        };
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
        res.json = actual => {
            actual.should.eql(expected);
            done();
        };
        mung.resources((r, req, res) => {
            r.a = 'a';
        })(req, res);
        res.json(resources);
    });

    it('should apply transformations in LIFO order', done => {
        let req = {},
            res = { headers: {'content-type': 'application/json; charset="utf-8"'} },
            next = () => null;
        let resources = {
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
        };
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
        res.json = actual => {
            actual.should.eql(expected);
            done();
        };
        mung.resources((r, req, res) => {
            r.a += 'b';
        })(req, res);
        mung.resources((r, req, res) => {
            r.a = 'a';
        })(req, res);
        res.json(resources);
    });

    it('should send 204 No Content when the resource is removed', done => {
        let req = {},
            res = { headers: {'content-type': 'application/json; charset="utf-8"'} },
            next = () => null,
            statusCode = 0;
        res.status = status => { statusCode = status; return res; };
        let resource = {
            _metadata: {
                self: '/api/x/123',
                type: 'x'
            }
        };
        res.json = actual => null;
        mung.resources((r, req, res) => null)(req, res);
        res.json(resource);
        statusCode.should.equal(204);
        done();
    });

    it('should send empty data when all resources are removed', done => {
        let req = {},
            res = { headers: {'content-type': 'application/json; charset="utf-8"'} },
            next = () => null;
        let resources = {
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
        };
        let expected = { data: [] };
        res.json = actual => {
            actual.should.eql(expected);
            done();
        };
        mung.resources((r, req, res) => null)(req, res);
        res.json(resources);
    });

    it('should abort when end is called', done => {
        let req = {},
            res = { headers: {'content-type': 'application/json; charset="utf-8"'} },
            next = () => null;
        let resource = {
            _metadata: {
                self: '/api/x/123',
                type: 'x'
            }
        };
        let expected = 'some message';
        res.send = actual => {
            res.headersSent = true;
            actual.should.equal(expected);
            done();
        };
        res.json = json => {
            console.log('should not be called', json);
        };
        res.end = buffer => { res.headersSent = true; };
        mung.resources((r, req, res) => {
            res.send(expected);
        })(req, res);
        res.json(resource);
    });


});
