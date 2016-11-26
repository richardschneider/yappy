'use strict';

let request = require('superagent');

var yandex = function (text, options) {
    let apiKey = options['!apikey'] || process.env.YandexKey;
    if (!apiKey)
        return Promise.reject(new Error('need the YandexKey'));

    return request
        .get(options.api)
        .query({
            key: apiKey,
            text: text.original,
            lang: text.from.substring(0, 2) + '-' + text.to.substring(0, 2)
        })
        .then(res => {
            text.translation = res.body.text[0];
            return text;
        });
};

yandex.details = {
    name: [{tag: 'en', text: 'yandex translator'}],
    use: 'translation',
    enabled: true,
    home: 'https://www.yandex.com',
    options: {
        api: 'https://translate.yandex.net/api/v1.5/tr.json/translate'
    },
};

module.exports = yandex;

