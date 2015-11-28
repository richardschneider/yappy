'use strict';

require('should');
var peers = require('../lib/pubsub');

describe ('Peers (pubsub)', () => {

    it('should be able to publish', () => {
        peers.should.have.property('publish');
    });

    it('should be able to subscribe', () => {
        peers.should.have.property('subscribe');
    });

    it('should be able to unsubscribe', () => {
        peers.should.have.property('unsubscribe');
    });

});

var request = require("supertest-as-promised");
var server = require('../lib/server');

var teddy = {
    name: [
        { tag: 'en', text: 'teddy bear'},
        { tag: 'zh-TW', text: '玩具熊' },
        { tag: 'zh-CH', text: '玩具熊' }
    ]
};

describe ('CRUD', () => {
    before (done => {
        peers.subscribe('/ecom/api/*');
        done();
    });

    after (done => {
        peers.subscribe('/ecom/api/*');
        done();
    });

    it('should publish /ecom/api/create on POST', done => {
        let topics = [
            '/ecom/api/create/bear',
            '/ecom/api/change/bear',
            '/ecom/api/delete/bear'];
        peers.on('message', function onMessage(topic, id) {
            topic.should.equal(topics.shift());
            if (topics.length == 0) {
                peers.removeListener('message', onMessage);
                return done();
            }
        });
        request(server).post('/api/bear').send(teddy).expect(201)
            .then(res => res.header['location'])
            .then(url => request(server).delete(url).expect(204));
    });

    it('should publish /ecom/api/change on PUT', done => {
        let topics = [
            '/ecom/api/create/bear',
            '/ecom/api/change/bear',
            '/ecom/api/change/bear',
            '/ecom/api/delete/bear'];
        peers.on('message', function onMessage(topic, id) {
            topic.should.equal(topics.shift());
            if (topics.length == 0) {
                peers.removeListener('message', onMessage);
                return done();
            }
        });
        request(server).post('/api/bear').send(teddy).expect(201)
            .then(res => res.header['location'])
            .then(url => request(server).put(url).send(teddy).expect(204).then(() => url))
            .then(url => request(server).delete(url).expect(204));
    });

    it('should publish /ecom/api/change on PATCH', done => {
        let patch = [
            { op: 'replace', path: '/name/0/text', value: 'yogi (1)' }
        ];
        let topics = [
            '/ecom/api/create/bear',
            '/ecom/api/change/bear',
            '/ecom/api/change/bear',
            '/ecom/api/delete/bear'];
        peers.on('message', function onMessage(topic, id) {
            topic.should.equal(topics.shift());
            if (topics.length == 0) {
                peers.removeListener('message', onMessage);
                return done();
            }
        });
        request(server).post('/api/bear').send(teddy).expect(201)
            .then(res => res.header['location'])
            .then(url => request(server).patch(url).send(JSON.stringify(patch)).set('content-type', 'application/json-patch+json').expect(204).then(() => url))
            .then(url => request(server).delete(url).expect(204));
    });

    it('should publish /ecom/api/change and delete on DELETE', done => {
        let topics = [
            '/ecom/api/create/bear',
            '/ecom/api/change/bear',
            '/ecom/api/delete/bear'];
        peers.on('message', function onMessage(topic, id) {
            topic.should.equal(topics.shift());
            if (topics.length == 0) {
                peers.removeListener('message', onMessage);
                return done();
            }
        });
        request(server).post('/api/bear').send(teddy).expect(201)
            .then(res => res.header['location'])
            .then(url => request(server).delete(url).expect(204));
    });

});
