'use strict';

var request = require("supertest-as-promised");
var should = require('should');
var extend = require('util')._extend;
var server = require('../lib/server');

var teddy = {
    name: [
        { tag: 'en', text: 'teddy bear'},
        { tag: 'zh-TW', text: '玩具熊' },
        { tag: 'zh-CH', text: '玩具熊' }
    ]
};

var southernTeddy = {
    name: [
        { tag: 'en', text: 'teddy bear'},
        { tag: 'zh-TW', text: '玩具熊' },
        { tag: 'zh-CH', text: '玩具熊' }
    ],
    likes: ['beer']
};

describe('Resource CRUD', function () {

    var postres;
    var teddyUrl;
    before(function (done) {
        request(server)
            .post('/api/bear')
            .send(teddy)
            .expect(201)
            .expect(function (res) {
                postres = res;
                teddyUrl = res.header['location'];
            })
            .end(done);            
    });
    
    after(function (done) {
        request(server)
            .delete(teddyUrl)
            .expect(204)
            .then(function () {
                request(server)
                    .get(teddyUrl)
                    .expect(404);
            })
            .then(done);
    });

    describe('Gradual upgrade', () => {
        
        it('should add new properties when not present', done => {
            request(server)
                .get(teddyUrl)
                .expect(200)
                .expect(res => {
                    res.body.should.have.property('likes');
                    res.body.likes[0].should.equal('honey');
                })
                .end(done);
        });
        
        it('should not change existing properties', done => { request(server)
            .put(teddyUrl)
            .send(southernTeddy)
            .expect(200)
            .then(() => { request(server)
                .get(teddyUrl)
                .expect(200)
                .expect(res => {
                    res.body.should.have.property('likes');
                    res.body.likes[0].should.equal('beer');
                })
                .end(done);
            });
        });
    });
    
    describe('GET', function () {

        it('should return Last-Modified header', function (done) {
            request(server)
                .get(teddyUrl)
                .expect('Last-Modified', /GMT/)
                .end(done);
        });

        it('should contain metadata with self and type', done => {
            request(server)
                .get(teddyUrl)
                .expect(200)
                .expect(res => {
                    res.body.should.have.property('_metadata');
                    res.body._metadata.should.have.property('self');
                    res.body._metadata.should.have.property('type');
                })
                .end(done);
        });

    });
    
    describe('GET list', function () {
        
        it('should return a list', done => {
            request(server)
                .get('/api/bear')
                .expect(res => {
                    res.body.should.be.instanceof(Array);
                })
                .end(done);
        });
        
        it('should return metadata for each element', done => {
            request(server)
                .get('/api/bear')
                .expect(res => {
                    res.body.forEach(e => {
                        e.should.have.property('_metadata');
                        e._metadata.should.have.property('self');
                        e._metadata.should.have.property('type');
                    });
                })
                .end(done);
        });
        
       
    });

    describe('POST', function () {
        
        it('should return 201 with a Location header relative to the server', function (done) {
            postres.header['location'].should.match(/^\/api\/bear/);
            done();
        });
       
        it('should return a body with status and refers to the new resource', function (done) {
            postres.body.status.should.equal('ok');
            postres.body.self.should.equal(teddyUrl);
            done();
        });
        
        it('should set modifiedOn', function (done) {
            request(server)
                .get(teddyUrl)
                .expect(200)
                .expect(function (res) {
                    res.body.should.have.property('modifiedOn');
                })
                .end(done);
        });

        it('returns Last-Modified header', function (done) {
            postres.header['last-modified'].should.match(/GMT/);
            done();
        });

        it('should return 422 and message when entity is empty', function (done) {
            request(server)
                .post('/api/bear')
                .send({})
                .expect(422)
                .expect(function (res) {
                    res.body.should.have.property('message');
                })
                .end(done);
        });
        
    });

    describe('PUT', () => {
       var teddy0;
       
        before(done => {
            request(server)
                .get(teddyUrl)
                .expect(200)
                .expect(res => { teddy0 = res.body; })
                .end(done);
        });
       
        it('should replace data', done => {
            teddy0.name[0].text = 'new name';

            request(server)
                .put(teddyUrl)
                .send(teddy0)
                .expect(200)
                .then(() => {
                    request(server)
                        .get(teddyUrl)
                        .expect(200)
                        .expect(res => { 
                            res.body.name[0].text.should.equal('new name');
                        })
                        .end(done);
                });
        }); 
        
        it('should error when resource does not exist', done => {
            request(server)
                .put('/api/bear/missing-id')
                .send(teddy0)
                .expect(404)
                .end(done);
        }); 
        
        it('should validate the data', done => {
            var teddy1 = extend({}, teddy0);            
            teddy1.name[0].tag = 'xx';

            request(server)
                .put(teddyUrl)
                .send(teddy1)
                .expect(422)
                .end(done);
        }); 
        
        it('should return Last-Modified header', done => {
            request(server)
                .put(teddyUrl)
                .send(teddy)
                .expect(200)
                .expect('Last-Modified', /GMT/)
                .end(done);
        }); 

    });
    
    describe('DELETE', () => {
        
        it('should be physical', done => {
            var url;
            request(server)
                .post('/api/bear')
                .send(teddy)
                .expect(201)
                .expect(res => { url = res.header['location']; })
                .then(() => request(server).get(url).expect(200))
                .then(() => request(server).delete(url).expect(204))
                .then(() => request(server).get(url).expect(404))
                .finally(() => done());
        });

        it('should return 404 when entity does not exist', done => {
            request(server)
                .delete('/api/bear/missing-id')
                .expect(404)
                .end(done);
        });
    });	
    
});
