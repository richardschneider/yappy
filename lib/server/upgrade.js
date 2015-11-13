'use strict';

/*
 * Middleware for model/schema upgrades.
 */
var Promise = require('bluebird');
var fs = require("fs");
var model = require('../model');

// FindOrCreate the model state.
let state = model.then(model => {
    let now = new Date();  
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

let immediateUpgrade = state
    .then(doc => true);
    
let gradualUpgrade = Promise.resolve({});

function upgrade (req, res, next) {
    gradualUpgrade.then(() => {
        next();
    });
}
upgrade.state = state;

module.exports = upgrade;
