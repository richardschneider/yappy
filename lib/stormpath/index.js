'use strict';

let express = require('express'),
    Promise = require('bluebird'),
    stormpath = Promise.promisifyAll(require('stormpath'));

let  app = express()

var homedir = (process.platform === 'win32') ? process.env.HOMEPATH : process.env.HOME;
var keyfile = homedir + '/.stormpath/apikey.properties';

app.locals.stormpath = {
    url: 'https://api.stormpath.com/v1'
};
app.locals.stormpath.client = stormpath.loadApiKeyAsync(keyfile)
    .then(apikey => new stormpath.Client({apiKey: apikey}));
app.locals.stormpath.app = app.locals.stormpath.client
    .then(client => {
        let apps = Promise.promisify(client.getApplications);
        return apps({name:'yappy'});
    })
    .then(applications => {
        let app = applications.items[0];
        return Promise.promisifyAll(app);
    });

app.use(require('../server/authorisation').allowsResourceAccess());
app.use(require('./user'));
app.use(require('./role'));

module.exports = app;