'use strict';

// link form is /api/<type>/<id>
let link = /^\/api\/(\w+)\/(\w+)$/;

link.parse = s => {
    let m = s.match(link);
    if (m == null || m.length != 3)
        throw new Error(`'${s}' is not a resource link`);
    return { type: m[1], id: m[2] };
};

module.exports = link;
