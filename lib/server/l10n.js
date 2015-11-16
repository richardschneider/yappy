'use strict';

let Promise = require('bluebird');
let Cache = require('cached-promise');
let request = require('../superagent-bluebird-promise');

var l10n = module.exports = {};

function mymemoryTranslate(text) {
    return request
        .get('http://api.mymemory.translated.net/get')
        .query({
            q: text.original,
            langpair: text.from + '|' + text.to
        })
        .then(res => {
            text.translation = res.body.responseData.translatedText;
            return text;
        });
}

var engines =  [mymemoryTranslate];

function translate(text)
{
    return engines[0](text); 
}

var translations = new Cache({
  max: 100,
  load: function (text, resolve, reject) {
        translate(text)
        .then(text => resolve(text))
        .catch(e => {
            text.to = text.from;
            return resolve(text);
        });
    }
});

l10n.translationEngines = engines;
l10n.translations = translations;
l10n.translate = (req, msg, tag) => {
    let from = 'en';
    let to = tag || req.locale;
    var text = {
        from: from,
        to: to,
        original: msg,
        translation: msg,
        key: msg + '|' + from + '|' + to
    };
    
    if (from == to)
        return Promise.resolve(text);

    return translations.get(text);
};

