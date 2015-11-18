'use strict';

require('should');
var schema = require('../lib/model/service');
var locator = require('../lib/service/locator');

describe('Service data type', function () {
    let service = {
        name: [{tag: 'en', text: 'my translator'}],
        use: 'translation',
        enabled: true,
        home: 'http://wikipedia',
        options: {},
        moduleName: "noop"
    }

    it('should have a name and use', function (done) {
        schema(service).should.be.true;
        done();
    });
});

describe('Service locator', function () {
    let noop = {
        name: [{tag: 'en', text: 'my translator'}],
        use: 'translation',
        enabled: true,
        home: 'http://wikipedia',
        options: {},
        moduleName: "noop",
        api: (arg, options) => Promise.resolve('did nothing with ' + arg)
    };
    let opts = {
        name: [{tag: 'en', text: 'my translator'}],
        use: 'translation',
        enabled: true,
        home: 'http://wikipedia',
        options: {
            url: 'nowhere'
        },
        moduleName: "opts",
        api: (arg, options) => {
            return Promise.resolve(options.url)
        }
    };
    let multiArg = {
        name: [{tag: 'en', text: 'my translator'}],
        use: 'translation',
        enabled: true,
        home: 'http://wikipedia',
        options: {},
        moduleName: "multiArg",
        api: (a, b, options) => Promise.resolve(`did nothing with ${a} and ${b}`)
    };
    let mailer = {
        name: [{tag: 'en', text: 'my translator'}],
        use: 'mailer',
        enabled: true,
        home: 'http://wikipedia',
        options: {},
        moduleName: "mailer",
        api: (arg, options) => Promise.resolve('did nothing with the mail')
    };
    let nyi = {
        name: [{tag: 'en', text: 'my translator'}],
        use: 'translation',
        enabled: true,
        home: 'http://wikipedia',
        options: {},
        moduleName: "nyi",
        api: (arg, options) => Promise.reject(new Error('not yet implemented'))
    };

    let disabled = {
        name: [{tag: 'en', text: 'my translator'}],
        use: 'translation',
        enabled: false,
        home: 'http://wikipedia',
        options: {},
        moduleName: "disabled",
        api: (arg, options) => Promise.reject(new Error('should not be called its disabled'))
    };

    it('should return a promise', done => {
        locator.allServices = [noop];
        locator
            .run('translation', 'hello world')
            .then(result => {
                result.should.equal('did nothing with hello world');
                done();
            })
            .catch(done);
    });

    it('should try all services until one resolves', done => {
        locator.allServices = [nyi, noop];
        locator
            .run('translation', 'hello world')
            .then(result => {
                result.should.equal('did nothing with hello world');
                done();
            })
            .catch(done);
    });

    it('should error if all services fail', done => {
        locator.allServices = [nyi, nyi];
        locator
            .run('translation', 'hello world')
            .then(result => {
                console.log('SHOULD NOT HAPPEN')
                done();
            })
            .catch(e => done())
    });

    it('should handle a serice throwing with no args', done => {
        locator.allServices = [opts];
        locator
            .run('translation')
            .then(result => {
                console.log('SHOULD NOT HAPPEN')
                done();
            })
            .catch(e => {
                e.message.should.equal("Cannot read property 'url' of undefined");
                done();
            })
    });

    it('should error with unknown service use', done => {
        locator.allServices = [];
        let fn = () => locator.run('translation', 'hello world');
        (fn).should.throw('No service found for translation');
        done();
    });

    it('should only run enabled services', done => {
        locator.allServices = [disabled];
        let fn = () => locator.run('translation', 'hello world');
        (fn).should.throw('No service found for translation');
        done();
    });

    it('should only run services with the correct usage', done => {
        locator.allServices = [mailer, noop];
        locator
            .run('translation', 'hello world')
            .then(result => {
                result.should.equal('did nothing with hello world');
                done();
            })
            .catch(done);
    });

    it('should pass multiple arguments to the service', done => {
        locator.allServices = [multiArg];
        locator
            .run('translation', 'hello', 'world')
            .then(result => {
                result.should.equal('did nothing with hello and world');
                done();
            })
            .catch(done);
    });

    it('should pass the service option(s) as the last parameter', done => {
        locator.allServices = [opts];
        locator
            .run('translation', 'hello world')
            .then(result => {
                result.should.equal('nowhere');
                done();
            })
            .catch(done);
    });
});
