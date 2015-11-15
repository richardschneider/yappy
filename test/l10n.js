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
        
        it('should support french translations', done => {
            l10n.translate(null, 'its time for a beer', 'fr')
            .then(t => t.translation.should.equal('il temps pour une bière'))
            .finally(() => done());
        });

   }) 
});