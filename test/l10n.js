'use strict';

var should = require('should');
var l10n = require('../lib/server/l10n');

describe('l10n', () => {
   
    describe('translation', () => {
        
        it('should return a translation', done => {
            l10n.translate(null, 'its time for a beer', 'fr')
            .then(t => t.translation.should.not.equal(t.original))
            .finally(() => done());
        });
       
        it('should not translate on same language', done => {
            l10n.translate(null, 'its time for a beer', 'en')
            .then(t => t.translation.should.equal(t.original))
            .finally(() => done());
        });
        
        it('should support French (fr) translations', done => {
            l10n.translate(null, 'its time for a beer', 'fr')
            .then(t => t.translation.should.equal('son temps pour une bière'))
            .finally(() => done());
        });

        it('should support Chineese (zh) translations', done => {
            l10n.translate(null, 'its time for a beer', 'zh')
            .then(t => t.translation.should.equal('一杯啤酒的时候了'))
            .finally(() => done());
        });

        it('should support Mainland China (zh-CN) translations', done => {
            l10n.translate(null, 'its time for a beer', 'zh-CN')
            .then(t => t.translation.should.equal('一杯啤酒的时候了'))
            .finally(() => done());
        });

        it('should support Hong Kong (zh-HK) translations', done => {
            l10n.translate(null, 'its time for a beer', 'zh-HK')
            .then(t => t.translation.should.equal('一杯啤酒的时候了'))
            .finally(() => done());
        });

        it('should support Taiwaneese (zh-TW) translations', done => {
            l10n.translate(null, 'its time for a beer', 'zh-TW')
            .then(t => t.translation.should.equal('一杯啤酒的時候了'))
            .finally(() => done());
        });
        
        it('should be 10x faster with a cache', done => {
            var start, first, second;
            l10n.translations.reset()
            .then(() => start = new Date())
            .then(() => l10n.translate(null, 'its time for a beer', 'fr'))
            .then(t => { var now = new Date(); first = now - start; start = now; })
            .then(() => l10n.translate(null, 'its time for a beer', 'fr'))
            .then(() => second = new Date() - start)
            .then(() => (first / 10).shoud.be.above(second))
            .finally(() => done());
        });

   }) 
});