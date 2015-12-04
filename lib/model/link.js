'use strict';

// link form is /api/<type>/<id>
let link = /^\/api\/(\w+)\/(\w+)$/;

link.tryParse = s => {
    let m = s.match(link);
    if (m == null || m.length != 3)
        return false;
    return { type: m[1], id: m[2] };
};

link.parse = s => {
    let x = link.tryParse(s);
    if (x === false)
        throw new Error(`'${s}' is not a resource link`);
    return x;
};

module.exports = link;
