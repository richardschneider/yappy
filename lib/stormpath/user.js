'use strict';

let express = require('express'),
    Promise = require('bluebird'),
    router = express.Router();

let accountOptions = { expand: 'groupMemberships,customData' };

/**
 * convert a stormpath account into a yappy user.
 */
function toUser(account)
{
    // console.log('stormpath account', account)
    let user = {
        displayName: [ { tag: 'en', text: account.username }],
        email: account.email,
        modifiedOn: account.modifiedAt,
        name: [ { tag: 'en', text: [account.givenName, account.middleName, account.surname].filter(n => n.length > 0).join(' ') }],
        permissions: [],
        roles: [],
        _metadata: {
            self: '/api/user/' + account.href.split('/').pop(),
            type: 'user'
        }
    };
    if (account.customData && account.customData.permissions)
        user.permissions = account.customData.permissions;
    if (account.groupMemberships.items)
        user.roles = account.groupMemberships.items.map(g => '/api/role/' + g.group.href.split('/').pop());

    return user;
}

/**
 * A promise to authenticate a user.
 *
 * @returns {User} info about the authenticated user.
 */
router.authenticate = function authenticate(username, password) {
    let app = require('./').locals.stormpath.app;
    let req = {
        username: username,
        password: password
    };
    return app
    .then(app => {
        return app.authenticateAccountAsync(req);
    })
    .then(result => {
        return new Promise(function (resolve, reject) {
            result.getAccount(accountOptions, (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });
    })
    .then(account => {
        if (account.status != 'ENABLED')
            return Promise.reject('account is disabled');
        let user = toUser(account);
        return user;
    });
};

router.get('/user', (req, res, next) => {
    req.app.locals.stormpath.app
    .then(app => app.getAccountsAsync(accountOptions))
    .then(results => {
        let content = {
            links: {
                self: req.originalUrl
            },
        };
        content.data = results.items.map(toUser);
        res
            .set('last-modified', new Date().toUTCString())
            .send(content)
            .end();
    })
    .catch(next);
});

router.get('/user/:id', (req, res) => {
    let stormpath = req.app.locals.stormpath;
    let url = stormpath.url + '/accounts/' + req.params.id;
    stormpath.client
    .then(client => client.getAccountAsync(url, accountOptions))
    .then(account => {
        let user = toUser(account);
        res
            .set('last-modified', new Date(user.modifiedOn).toUTCString())
            .send(user)
            .end();
    })
    .catch(e => res.sendError(404, e));
});

module.exports = router;
