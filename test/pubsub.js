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

var request = require("./my-supertest");
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
        peers.subscribe('/yappy/api/*');
        done();
    });

    after (done => {
        peers.unsubscribe('/yappy/api/*');
        done();
    });

    it('should publish /yappy/api/create on POST', done => {
        let topics = [
            '/yappy/api/create/bear',
            '/yappy/api/change/bear',
            '/yappy/api/delete/bear'];
        peers.on('message', function onMessage(topic) {
            if (!topic.startsWith('/yappy/api/')) return;
            topic.should.equal(topics.shift());
            if (topics.length === 0) {
                peers.removeListener('message', onMessage);
                return done();
            }
        });
        request(server).post('/api/bear').send(teddy).expect(201)
            .then(res => res.header['location'])
            .then(url => request(server).delete(url).expect(204));
    });

    it('should publish /yappy/api/change on PUT', done => {
        let topics = [
            '/yappy/api/create/bear',
            '/yappy/api/change/bear',
            '/yappy/api/change/bear',
            '/yappy/api/delete/bear'];
        peers.on('message', function onMessage(topic) {
            if (!topic.startsWith('/yappy/api/')) return;
            topic.should.equal(topics.shift());
            if (topics.length === 0) {
                peers.removeListener('message', onMessage);
                return done();
            }
        });
        request(server).post('/api/bear').send(teddy).expect(201)
            .then(res => res.header['location'])
            .then(url => request(server).put(url).send(teddy).expect(204).then(() => url))
            .then(url => request(server).delete(url).expect(204));
    });

    it('should publish /yappy/api/change on PATCH', done => {
        let patch = [
            { op: 'replace', path: '/name/0/text', value: 'yogi (1)' }
        ];
        let topics = [
            '/yappy/api/create/bear',
            '/yappy/api/change/bear',
            '/yappy/api/change/bear',
            '/yappy/api/delete/bear'];
        peers.on('message', function onMessage(topic) {
            if (!topic.startsWith('/yappy/api/')) return;
            topic.should.equal(topics.shift());
            if (topics.length === 0) {
                peers.removeListener('message', onMessage);
                return done();
            }
        });
        request(server).post('/api/bear').send(teddy).expect(201)
            .then(res => res.header['location'])
            .then(url => request(server).patch(url).send(JSON.stringify(patch)).set('content-type', 'application/json-patch+json').expect(204).then(() => url))
            .then(url => request(server).delete(url).expect(204));
    });

    it('should publish /yappy/api/change and delete on DELETE', done => {
        let topics = [
            '/yappy/api/create/bear',
            '/yappy/api/change/bear',
            '/yappy/api/delete/bear'];
        peers.on('message', function onMessage(topic) {
            if (!topic.startsWith('/yappy/api/')) return;
            topic.should.equal(topics.shift());
            if (topics.length === 0) {
                peers.removeListener('message', onMessage);
                return done();
            }
        });
        request(server).post('/api/bear').send(teddy).expect(201)
            .then(res => res.header['location'])
            .then(url => request(server).delete(url).expect(204));
    });

});
