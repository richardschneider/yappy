'use strict';

require('should');
let model = require('../lib/model/resource/tenant');

describe ('Tenant', () => {

    it('should export a model', () => {
        model.should.have.property('schema');
        model.should.have.property('upgrade');
    });
    
    it('should contain default values', () => {
        let r = model.upgrade({});
        r.should.have.property('language');
        r.should.have.property('forex');
        r.should.have.property('services');
    });

    it('should be valid when new', () => {
        let r = model.upgrade({ 
            name: [{ tag: 'en', text: 'x'}],
            domain: 'x'});
        let errs = model.schema.jpErrors(r);
        errs.should.equal(false);
    });

    it('should contain new services', () => {
        let r = model.upgrade({});
        let n = r.services.length;
        r.services = r.services.slice(1);
        let r1 = model.upgrade(r);
        r1.services.length.should.equal(n);
    });
    
    it('should validate the services', () => {
        let r = model.upgrade({ 
            name: [{ tag: 'en', text: 'x'}],
            domain: 'x'});
        r.services.push({});
        let errs = model.schema.jpErrors(r);
        errs.should.not.equal(false);
        errs.should.be.instanceof(Object);
    });

    
});
