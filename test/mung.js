'use strict';

require('should');
let mung = require('../lib/server/mung');

let nyi = new Error('nyi');

describe('mung', function () {

    it('should only process a resource', done => {
        let req = {}, res = {}, next = () => null;
        let expected = 'not a resource';
        res.send = actual => {
            actual.should.equal(expected);
            done();
        };
        mung(req, res, next);
        res.send(expected);
    });

    it('should send the transformed resource', done => {
        let req = {}, res = {}, next = () => null;
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
        res.send = actual => {
            actual.should.eql(expected);
            done();
        };
        mung(req, res, next);
        res.mung((r, req, res) => {
            r.a = 'a';
        });
        res.send(resource);
    });

    it('should process a list of resources by transforming one resource at a time', done => {
        let req = {}, res = {}, next = () => null;
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
        }
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
        res.send = actual => {
            actual.should.eql(expected);
            done();
        };
        mung(req, res, next);
        res.mung((r, req, res) => {
            r.a = 'a';
        });
        res.send(resources);
    });

    it('should apply transformations in LIFO order', done => {
        let req = {}, res = {}, next = () => null;
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
        res.send = actual => {
            actual.should.eql(expected);
            done();
        };
        mung(req, res, next);
        res.mung((r, req, res) => {
            r.a += 'b';
        });
        res.mung((r, req, res) => {
            r.a = 'a';
        });
        res.send(resources);
    });

    it('should send 204 No Content when the resource is removed', done => {
        let req = {}, res = {}, next = () => null,
            statusCode = 0;
        res.status = status => { statusCode = status; };
        let resource = {
            _metadata: {
                self: '/api/x/123',
                type: 'x'
            }
        };
        res.send = actual => {
            done(new Error('should not be called'));
        };
        mung(req, res, next);
        res.mung((r, req, res) => null);
        res.send(resource);
        statusCode.should.equal(204);
        done();
    });

    it('should send empty data when all resources are removed', done => {
        let req = {}, res = {}, next = () => null;
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
        res.send = actual => {
            actual.should.eql(expected);
            done();
        };
        mung(req, res, next);
        res.mung((r, req, res) => null);
        res.send(resources);
    });

    it('should abort when send is called', done => {
        let req = {}, res = {}, next = () => null;
        let resource = {
            _metadata: {
                self: '/api/x/123',
                type: 'x'
            }
        };
        let expected = 'some message';
        res.send = actual => {
            actual.should.equal(expected);
            done();
        };
        mung(req, res, next);
        res.mung((r, req, res) => {
            res.send(expected);
        });
        res.send(resource);
    });


});
