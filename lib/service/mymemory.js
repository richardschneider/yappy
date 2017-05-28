'use strict';

let request = require('superagent-bluebird-promise');

var mymemory = function (text, options) {
    return request
        .get(options.api)
        .query({
            q: text.original,
            langpair: text.from + '|' + text.to
        })
        .then(res => {
            text.translation = res.body.responseData.translatedText;
            if (text.translation.startsWith('MYMEMORY WARNING:'))
                throw new Error(text.translation);
            return text;
        });
}

mymemory.details = {
    name: [{tag: 'en', text: 'my memory translator'}],
    use: 'translation',
    enabled: true,
    home: 'http://mymemory.translated.net/',
    options: {
        api: 'http://api.mymemory.translated.net/get'
    },
};

module.exports = mymemory;

