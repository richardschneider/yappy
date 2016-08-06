'use strict';

let express = require('express'),
    router = express.Router();

function toRole(group)
{
    let role = {
        name: [ { tag: 'en', text: group.name }],
        description: [ { tag: 'en', text: group.description}],
        permissions: group.customData.permissions || [],
        modifiedOn: group.modifiedAt,
        _metadata: {
            self: '/api/role/' + group.href.split('/').pop(),
            type: 'role'
        }
    };
    return role;
}

router.get('/role', (req, res, next) => {
    req.app.locals.stormpath.app
    .then(app => app.getGroupsAsync({ expand: 'customData'}))
    .then(results => {
        let content = {
            links: {
                self: req.originalUrl
            },
        };
        content.data = results.items.map(toRole);
        res
            .set('last-modified', new Date().toUTCString())
            .send(content)
            .end();
    })
    .catch(next);
});

router.get('/role/:id', (req, res, next) => {
    let stormpath = req.app.locals.stormpath;
    let url = stormpath.url + '/groups/' + req.params.id;
    stormpath.client
    .then(client => client.getGroupAsync(url, { expand: 'customData'}))
    .then(group => {
        let role = toRole(group);
        res
            .set('last-modified', new Date(role.modifiedOn).toUTCString())
            .send(role)
            .end();
    })
    .catch(e => res.sendError(404, e));
});

module.exports = router;
