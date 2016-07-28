'use strict';

let Promise = require('bluebird');
let Cache = require('cached-promise');
let runner = require('../service/locator');
let log = require('log4js').getLogger('l10n');

var l10n = module.exports = {
    developmentLanguage: 'en'
};

/*
 * An in-memory cache of translation keyed by phrase, from lang and to lang.
 */
var translations = new Cache({
  max: 100,
  load: function (text, resolve, reject) {
    let args = [text.engines];
    if (text.req) args.push(text.req);
    args.push(text);
    return runner.run.apply(this, args)
        .then(text => resolve(text))
        .catch(e => {
            log.error("translation error", e);
            text.to = text.from;
            return resolve(text);
        });
    }
});

l10n.translations = translations;
l10n.translate = (req, msg, tag) => {
    let from = l10n.developmentLanguage;
    let to = tag || req.locale || from;
    var text = {
        req: req,
        from: from,
        to: to,
        original: msg,
        translation: msg,
        key: msg + '|' + from + '|' + to,
        engines: (req && req.services) ? req.services.translation : 'translation'
    };

    if (from == to)
        return Promise.resolve(text);

    return translations.get(text);
};

