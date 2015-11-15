'use strict';

let Promise = require('bluebird');

var l10n = {};

l10n.translate = (req, msg, tag) => {
    let from = 'en';
    let to = tag || req.locale;
    var translation = {
        from: from,
        to: to,
        original: msg,
        translation: msg
    };
    
    if (from == to)
        return Promise.resolve(translation);

    translation.translation = to + ' - ' + msg;
    return Promise.resolve(translation);
};

module.exports = l10n;