'use strict';

let Promise = require('bluebird');
let request = require('../superagent-bluebird-promise');

var l10n = module.exports = {};

function translate(text) {
    return request
        .get('http://api.mymemory.translated.net/get')
        .query({
            q: text.original,
            langpair: text.from + '|' + text.to
        });
}

l10n.translate = (req, msg, tag) => {
    let from = 'en';
    let to = tag || req.locale;
    var text = {
        from: from,
        to: to,
        original: msg,
        translation: msg
    };
    
    if (from == to)
        return Promise.resolve(text);

    return translate(text)
        .then(res => {
            text.translation = res.body.responseData.translatedText;
            return text;
        })
        .catch(e => {
            text.to = text.from;
            return Promise.resolve(text);
        });
};

