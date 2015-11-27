'use strict';

let schema = require('js-schema-6901'),
    ietf = require('../ietf'),
    iso = require('../iso');

module.exports = {
    collectionName: 'fs.files',
    readOnly: true,
    upgrade: media => {
      media.modifiedOn = media.uploadDate.toISOString();
      media.uploadDate = media.aliases = undefined;
      return media;
    },
    schema: schema('Multi-media image, video, audio...', {
        filename: String,
        contentType: ietf.mimeType,
        length: Number,
        modifiedOn: iso.dateTime,
        md5: String
    }),
};