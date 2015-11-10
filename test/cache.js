'use strict';

var request = require("supertest-as-promised");
var should = require('should');
var server = require('../lib/server');

server.timeout = 10000;

describe('Cache', function () {
    let oneDay = 86400000;
    var teddyUrl;
    var lastModified;
    var teddy = {
        name: [
            { tag: 'en', text: 'teddy bear'},
            { tag: 'zh-TW', text: '玩具熊' },
            { tag: 'zh-CH', text: '玩具熊' }
        ]
    };

    before(function (done) {
        request(server)
            .post('/api/bear')
            .send(teddy)
            .expect(201)
            .expect(function (res) {
              teddyUrl = res.header['location'];
              lastModified = new Date(res.header['last-modified']);
            })
            .end(done);
    });

    it('return 304 when cache date is equal last modified', function (done) {
        request(server)
            .get(teddyUrl)
            .set('if-modified-since', lastModified.toUTCString())
            .expect(304)
            .end(done);            
    });
   
    it('return 304 when cache date is greater than last modified', function (done) {
        request(server)
            .get(teddyUrl)
            .set('if-modified-since', new Date(lastModified.getTime() + oneDay).toUTCString())
            .expect(304)
            .end(done);            
    });

    it('return 200 when cache date is less than last modified', function (done) {
        request(server)
            .get(teddyUrl)
            .set('if-modified-since', new Date(lastModified.getTime() - oneDay).toUTCString())
            .expect(200)
            .end(done);            
    });

});
