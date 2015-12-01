'use strict';

var should = require('should');
var schema = require('js-schema-6901');
var link = require('../lib/model/link');


describe('Link data type', function () {
    let image = schema({
       href: link
    });

    it('starts with "/api/<type>/<id>"', function (done) {
        image({ href: "/foo/bear/1" }).should.be.false;
        image({ href: "/api/bear/1" }).should.be.true;
        done();
    });

    it('can be parsed into its component type and id', () => {
        let resource = link.parse('/api/bear/123');
        resource.should.have.property('type', 'bear');
        resource.should.have.property('id', '123');
        try {
            link.parse('/api/bar');
            should.fail();
        }
        catch (e) {
            e.message.should.equal("'/api/bar' is not a resource link");
        }
    });

})