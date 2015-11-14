'use strict';

require('../promises');

/*
 * Middleware for model/schema upgrades.
 */
var Promise = require('bluebird');
var fs = require('fs');
var path = require('path');
var model = require('../model');
var modelUnwrapped;

// FindOrCreate the model state.
let state = model.then(model => {
    let now = new Date();  
    modelUnwrapped = model;
    let upgrade = {
        version: '2015-11-11 init',
        appliedOn: now.toISOString()
    };
    let day0 = {
        current: upgrade,
        history: [upgrade],
        modifiedOn: now.toISOString()
    };
    return model.upgrade.collection()
        .findAndModifyAsync(
          { _id: model.upgrade.name },
          { },
          { $setOnInsert: day0 },
          {'new' : true, upsert: true, w: 1}
        );
});

// Perform an immediate upgrade for all un-applied scripts.
var currentVersion;
let immediateUpgrade = state
.then(s => {
    currentVersion = s.value.current.version; 
    return currentVersion;
})
.then(v => fs.readdirAsync('./lib/model/upgrade'))
.filter(fn => fn > currentVersion)
.call("sort", (a,b) => a.localeCompare(b))
.map(filename => {
    let patchName = path.basename(filename, '.js');
    let upgrade = {
        version: patchName,
        path: '../model/upgrade/' + patchName,
    };
    let patch = require(upgrade.path);
    console.log('applying upgrade', patchName);
    return patch(modelUnwrapped).then(() => upgrade);
})
.each(patch => {
    let now = new Date().toISOString();
    let upgrade = {
        version: patch.version,
        appliedOn: now
    };
    return modelUnwrapped.upgrade.collection().updateAsync(
        { _id: modelUnwrapped.upgrade.name },
        { 
            $push: { history: upgrade },
            $set: {
              current: upgrade,
              modifiedOn: now
            }
        }
    ); 
})
.then(() => console.log('upgrade finished'));

let gradualUpgrade = Promise.resolve({});

function upgrade (req, res, next) {
    gradualUpgrade.then(() => {
        next();
    });
}

upgrade.state = state;
upgrade.immediate = immediateUpgrade;

module.exports = upgrade;
