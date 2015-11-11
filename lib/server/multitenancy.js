'use strict';

var express = require('express');
var router = express.Router();

router.use(function (req, res, next) {
    req.tenantId = 42; // TODO: find the tenant id
    next();
});

module.exports = router;
