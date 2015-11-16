'use strict';

let Promise = require('bluebird');
let Cache = require('cached-promise');
let process = require('process');
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

function yandexTranslate(text) {
    let apiKey = process.env.YandexKey;
    if (!apiKey)
        return Promise.reject(new Error('need the YandexKey'));
        
    return request
        .get('https://translate.yandex.net/api/v1.5/tr.json/translate')
        .query({
            key: apiKey,
            text: text.original,
            lang: text.from.substring(0, 2) + '-' + text.to.substring(0, 2)
        })
        .then(res => {
            text.translation = res.body.text[0];
            return text;
        });
}

var engines = [mymemoryTranslate, yandexTranslate];

function translate(text)
{
    let services = engines.slice();
    var service = null;
    let callNext = () => {
        service = services.shift();
        console.log('calling', service.name);
        return service(text).catch(serviceError);
    };
    let serviceError = e => {
        console.log(service.name, 'failed with', e.message);
        return callNext();
    };
    return callNext();
}

var translations = new Cache({
  max: 100,
  load: function (text, resolve, reject) {
        return translate(text)
        .then(text => resolve(text))
        .catch(e => {
            console.log("translation error", e);
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

