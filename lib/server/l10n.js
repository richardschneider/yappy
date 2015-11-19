'use strict';

let Promise = require('bluebird');
let Cache = require('cached-promise');
let runner = require('../service/locator');

var l10n = module.exports = {
    developmentLanguage: 'en'
};


/*
 * An in-memory cache of translation keyed by phrase, from lang and to lang.
 */
var translations = new Cache({
  max: 100,
  load: function (text, resolve, reject) {
        return runner.run(text.engines, text)
        .then(text => resolve(text))
        .catch(e => {
            console.log("translation error", e);
            text.to = text.from;
            return resolve(text);
        });
    }
});

l10n.translations = translations;
l10n.translate = (req, msg, tag) => {
    let from = l10n.developmentLanguage;
    let to = tag || req.locale;
    var text = {
        from: from,
        to: to,
        original: msg,
        translation: msg,
        key: msg + '|' + from + '|' + to,
        engines: req ? req.services.translation : 'translation'
    };
    
    if (from == to)
        return Promise.resolve(text);

    return translations.get(text);
};

