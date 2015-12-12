'use strict';

let express = require('express'),
    router = express.Router();

function toUser(account)
{
    let user = {
        displayName: [ { tag: 'en', text: account.username }],
        email: account.email,
        modifiedOn: account.modifiedAt,
        name: [ { tag: 'en', text: [account.givenName, account.middleName, account.surname].filter(n => n.length > 0).join(' ') }],
        permissions: [],
        roles: account.groupMemberships.items.map(g => '/api/role/' + g.group.href.split('/').pop()),
        _metadata: {
            self: '/api/user/' + account.href.split('/').pop(),
            type: 'user'
        }
    };
    return user;
}

router.get('/user', (req, res, next) => {
    req.app.locals.stormpath.app
    .then(app => app.getAccountsAsync({ expand: 'groupMemberships' }))
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
    });
});

router.get('/user/:id', (req, res, next) => {
    let stormpath = req.app.locals.stormpath;
    let url = stormpath.url + '/accounts/' + req.params.id;
    stormpath.client
    .then(client => client.getAccountAsync(url, { expand: 'groupMemberships' }))
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
