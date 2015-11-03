'use strict';

var should = require('should');
var sally = require('../server/sally');
var server = require('../server');
var request = require("supertest-as-promised");

describe('Sally', function () {
    let d1 = sally.sign('a');
    let d2 = sally.sign('b', d1);
    let d3 = sally.sign('c', d2);

    it('should pass an untampered log', function (done) {
        sally.verify('a', d1).should.be.true;
        sally.verify('b', d2, d1).should.be.true;
        sally.verify('c', d3, d2).should.be.true;
        done();
    });
   
    it('should fail when audit line tampered', function (done) {
        sally.verify('aX', d1).should.be.false;
        sally.verify('bX', d2, d1).should.be.false;
        sally.verify('cX', d3, d2).should.be.false;
        done();
    });

    it('should fail when audit line and digest tampered', function (done) {
        let d2X = sally.sign('bX', d1);
        sally.verify('a', d1).should.be.true;
        sally.verify('bX', d2X, d1).should.be.true;
        sally.verify('c', d3, d2X).should.be.false;
        done();
    });

    it('should fail when 1st audit line and digest tampered', function (done) {
        let d1X = sally.sign('aX');
        sally.verify('aX', d1X).should.be.true;
        sally.verify('b', d2, d1X).should.be.false;
        done();
    });

    it('should detect a deleted audit line', function (done) {
        sally.verify('a', d1).should.be.true;
        sally.verify('c', d3, d1).should.be.false;
        done();
    });

    it('should detect the 1st audit line is deleted', function (done) {
        sally.verify('b', d2).should.be.false;
        done();
    });
    
    it('should sign and verify objects', function (done) {
        let x = { who: 'emanon', where: 'erehwon' };
        let y = { who: 'emanon', where: 'erehwon' };
        let z = { who: 'noname', where: 'nowhere' };
        
        sally.verify(x, sally.sign(x)).should.be.true;
        sally.verify(x, sally.sign(y)).should.be.true;
        sally.verify(x, sally.sign(z)).should.be.false;
        done();
    });

});

describe('Sally middleware', function () {

    var teddyUrl;
    
    it('should log on POST', function (done) {
        var teddy = {
            name: [
                { tag: 'en', text: 'teddy bear'},
                { tag: 'zh-TW', text: '玩具熊' },
                { tag: 'zh-CH', text: '玩具熊' }
            ]
        };

        var sallyEmit = false;
        sally.once('log', function(audit, digest) {
            audit.why.should.equal('POST');
            digest.should.not.be.null;
            sallyEmit = true;
        });

        request(server)
            .post('/api/bear')
            .send(teddy)
            .expect(201)
            .expect(function (res) {
                teddyUrl = res.header['location'];
            })
            .expect(function () {
                sallyEmit.should.be.true;
            })
            .end(done);
    });

    
    it('should not log on GET', function (done) {
        var sallyEmit = false;
        sally.once('log', function(audit, digest) {
            sallyEmit = true;
        });

        request(server)
            .get(teddyUrl)
            .expect(200)
            .expect(function () {
                sallyEmit.should.be.false;
            })
            .end(done);
    });

    
    it('should log on GET failure', function (done) {
        var sallyEmit = false;
        sally.once('log', function(audit, digest) {
            audit.why.should.equal('GET');
            digest.should.not.be.null;
            sallyEmit = true;
        });

        request(server)
            .get("/api/bear/unknown")
            .expect(404)
            .expect(function () {
                sallyEmit.should.be.true;
            })
            .end(done);
    });
    
});