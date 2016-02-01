'use strict';

require('should');
let request = require("./my-supertest"),
    server = require('../lib/server'),
    extend = require('util')._extend;

let teddy = {
    name: [
        { tag: 'en', text: 'teddy bear'},
        { tag: 'zh-TW', text: '玩具熊' },
        { tag: 'zh-CH', text: '玩具熊' }
    ],
    likes: ['beer']
};

describe('Search', function () {
    let urls = [];
    let dob = ['2014-04-01', '2014-04-02', '2014-04-03', '2014-04-04', '2014-04-05'];
    function createTeddy(dob) {
        let t = extend({}, teddy);
        t.dob = dob;
        return request(server)
            .post('/api/bear')
            .set('host', 'search-3.yappy.io')
            .send(t)
            .expect(201)
            .expect(function (res) {
                urls.push(res.header['location']);
            });
    }
    function deleteTeddy(url) {
        return request(server)
            .delete(url)
            .set('host', 'search-3.yappy.io')
            .expect(204);
    }

    let tenant = {
        name: [{tag: 'en', text: 'me'}],
        domain: 'search-3',
        httpResponse: {
            maxResources: 3,
        }
    };
    function createTenant() {
        return request(server)
            .post('/api/tenant')
            .send(tenant)
            .expect(201)
            .expect(res => {
                urls.push(res.header['location']);
            });
    }

    before(function (done) {
        createTenant()
        .then(() => {
            let setup = [];
            for (let i = 0; i < 5; ++i) {
                setup.push(createTeddy(dob[i]));
            }
            Promise.all(setup)
            .then(() => done())
            .catch(e => done(e));
        });
    });

    after(function (done) {
        let teardown = urls.map(u => deleteTeddy(u));
        Promise.all(teardown)
            .then(() => done())
            .catch(e => done(e));
    });

    it('should return links and data', done => {
        request(server)
            .get('/api/bear?n=1')
            .set('host', 'search-3.yappy.io')
            .expect(200)
            .expect(res => {
                res.body.should.have.property('links');
                res.body.links.should.have.property('self');
                res.body.should.have.property('data')
                    .and.have.lengthOf(1);
            })
            .end(done);
    });

    describe('Paging', () => {

        it('should limit the number of results with query param `?n`', done => {
            request(server)
                .get('/api/bear?n=2')
                .set('host', 'search-3.yappy.io')
                .expect(200)
                .expect(res => {
                    res.body.data.should.have.lengthOf(2);
                })
                .end(done);
        });

        it('should have a tenant specific upper limit for the number of results', done => {
            request(server)
                .get('/api/bear')
                .set('host', 'search-3.yappy.io')
                .expect(200)
                .expect(res => {
                    res.body.data.should.have.lengthOf(tenant.httpResponse.maxResources);
                })
                .end(done);
        });

        it('should enforce the tenant specific upper limit for the number of results', done => {
            request(server)
                .get('/api/bear?n=' + (tenant.httpResponse.maxResources + 10))
                .set('host', 'search-3.yappy.io')
                .expect(200)
                .expect(res => {
                    res.body.data.should.have.lengthOf(tenant.httpResponse.maxResources);
                })
                .end(done);
        });

        it('should allow offset into results with query param `?o`', done => {
            request(server)
                .get('/api/bear?o=0&n=2')
                .set('host', 'search-3.yappy.io')
                .expect(200)
                .then(res => {
                    res.body.data.should.have.lengthOf(2);
                    return res.body.data;
                })
                .then(teddies => {
                    request(server)
                        .get('/api/bear?o=1&n=1')
                        .set('host', 'search-3.yappy.io')
                        .expect(200)
                        .then(res => {
                            res.body.data.should.have.lengthOf(1);
                            res.body.data[0]._metadata.self.should.equal(teddies[1]._metadata.self);
                        });
                })
                .then(() => done())
                .catch(e => done(e));
        });

        it('should set `first`, `next` and `prev` links', done => {
            request(server)
                .get('/api/bear?o=0&n=2')
                .set('host', 'search-3.yappy.io')
                .expect(200)
                .then(res => {
                    res.body.data.should.have.lengthOf(2);
                    res.body.links.should.have.property('first');
                    res.body.links.should.have.property('next');
                    res.body.links.should.not.have.property('prev');
                    return res.body;
                })
                .then(result => {
                    request(server)
                        .get(result.links.next)
                        .set('host', 'search-3.yappy.io')
                        .expect(200)
                        .then(res => {
                            res.body.data.should.have.lengthOf(2);
                            res.body.links.should.have.property('first');
                            res.body.links.should.have.property('next');
                            res.body.links.should.have.property('prev');
                        });
                })
                .then(() => done())
                .catch(e => done(e));
        });

    });

    describe('Sorting', () => {

        it('should order by ascending or descending', done => {
            request(server)
                .get('/api/bear?n=2&sort=modifiedOn')
                .set('host', 'search-3.yappy.io')
                .expect(200)
                .then(res => {
                    res.body.data.should.have.lengthOf(2);
                    let first = res.body.data[0]._metadata.self;
                    request(server)
                        .get('/api/bear?n=2&sort=-modifiedOn')
                        .set('host', 'search-3.yappy.io')
                        .expect(200)
                        .then(res => {
                            res.body.data.should.have.lengthOf(2);
                            let other = res.body.data[0]._metadata.self;
                            first.should.not.equal(other);
                        });
                })
                .then(() => done())
                .catch(e => done(e));
        });

    });

    describe('Filtering - MQL', () => {

        it('should accept a mongo query document', done => {
            let queryBeer = { 'likes': {$eq: 'beer'} };
            let queryHoney = { 'likes': {$eq: 'honey'} };
            request(server)
                .post('/api/bear/find')
                .set('host', 'search-3.yappy.io')
                .send(queryBeer)
                .expect(200)
                .then(res => res.body.data.should.have.lengthOf(tenant.httpResponse.maxResources))
                .then(() => request(server)
                    .post('/api/bear/find')
                    .set('host', 'search-3.yappy.io')
                    .send(queryHoney)
                    .expect(200)
                )
                .then(res => res.body.data.should.have.lengthOf(0, 'no one likes honey'))
                .then(() => done())
                .catch(e => done(e));
        });

        it('should find dates by YYYY-MM', done => {
            let query = { dob: { $regex: '^2014-04' }};
            request(server)
                .post('/api/bear/find')
                .set('host', 'search-3.yappy.io')
                .send(query)
                .expect(200)
                .then(res => res.body.data.should.have.lengthOf(tenant.httpResponse.maxResources))
                .then(() => done())
                .catch(e => done(e));
        });

        it('should find dates by YYYY-MM-DD', done => {
            let query = { dob: { $regex: '^2014-04-01' }};
            request(server)
                .post('/api/bear/find')
                .set('host', 'search-3.yappy.io')
                .send(query)
                .expect(200)
                .then(res => res.body.data.should.have.lengthOf(1))
                .then(() => done())
                .catch(e => done(e));
        });

        it('shoud error on invalid operator', done => {
            let queryBad = { 'likes': {$foo: 'beer'} };
            request(server)
                .post('/api/bear/find')
                .set('host', 'search-3.yappy.io')
                .send(queryBad)
                .expect(400)
                .then(() => done())
                .catch(e => done(e));
        });

    });


});
