'use strict';

var should = require('should');
var l10n = require('../lib/server/l10n');

describe('l10n', () => {
   
    describe('translation', () => {
        before(done => {
            require('../lib/service/locator').loadAllServices();
            done();
        });
        
        it('should return a translation', done => {
            l10n.translate(null, 'its time for a beer', 'fr')
            .then(t => {
                t.translation.should.not.equal(t.original);
                done();
            })
            .catch(e => done(e));
        });
       
        it('should not translate on same language', done => {
            l10n.translate(null, 'its time for a beer', 'en')
            .then(t => {
                t.translation.should.equal(t.original); 
                done();
            })
            .catch(e => done(e));
        });
        
        it('should support French (fr) translations', done => {
            l10n.translate(null, 'its time for a beer', 'fr')
            .then(t => {
                t.translation.should.equal('son temps pour une bière');
                done();
            })
            .catch(e => done(e));
        });

        // it('should support Chineese (zh) translations', done => {
        //     l10n.translate(null, 'its time for a beer', 'zh')
        //     .then(t => {
        //         t.translation.should.equal('一杯啤酒的时候了');
        //         done(); 
        //     })
        //     .catch(e => done(e));
        // });

        // it('should support Mainland China (zh-CN) translations', done => {
        //     l10n.translate(null, 'its time for a beer', 'zh-CN')
        //     .then(t => {
        //         t.translation.should.equal('一杯啤酒的时候了');
        //         done(); 
        //     })
        //     .catch(e => done(e));
        // });


        it('should be 10x faster with a cache', done => {
            var start, first, second;
            l10n.translations.reset()
            .then(() => {
                start = new Date();
            })
            .then(() => l10n.translate(null, 'its time for a beer', 'fr'))
            .then(t => { 
                var now = new Date(); 
                first = now - start; 
                start = now;
            })
            .then(() => l10n.translate(null, 'its time for a beer', 'fr'))
            .then(() => {
                second = new Date() - start;
                let x = first / 10;
                x.should.be.above(second);
                done();
            })
            .catch(e => done(e));
        });

   }) 
});