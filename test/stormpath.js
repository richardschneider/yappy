'use strict';

require('should');
let request = require("./my-supertest"),
    server = require('../lib/server'),
    user_schema = require('../lib/model/resource/user').schema,
    role_schema = require('../lib/model/resource/role').schema,
    User = require('../lib/stormpath/user');

describe('Stormpath', () => {

    it('should authenticate acccounts', done => {
        User.authenticate('storm', '1Password!')
            .then(() => done())
    });

    it('should not authenticate bad acccounts', done => {
        User.authenticate('storm', 'xxxxxxx')
            .then(() => done(new Error('should not happen')))
            .catch(() => done());
    });

    it('should list users', done => {
        request(server)
            .get('/api/user')
            .expect(200)
            .expect(res => {
                res.body.should.have.property('data');
            })
            .end(done);
    });

    it('should list roles', done => {
        request(server)
            .get('/api/role')
            .expect(200)
            .expect(res => {
                res.body.should.have.property('data');
            })
            .end(done);
    });

    it('should return schema valid users', done => {
        request(server)
            .get('/api/user')
            .expect(200)
            .expect(res => {
                for (let user of res.body.data)
                {
                    let errors = user_schema.jpErrors(user);
                    if (errors)
                        console.log(errors);
                    errors.should.be.false;
                }
            })
            .end(done);
    });

    it('should return schema valid roles', done => {
        request(server)
            .get('/api/role')
            .expect(200)
            .expect(res => {
                for (let role of res.body.data)
                {
                    let errors = role_schema.jpErrors(role);
                    if (errors)
                        console.log(errors);
                    errors.should.be.false;
                }
            })
            .end(done);
    });

});
