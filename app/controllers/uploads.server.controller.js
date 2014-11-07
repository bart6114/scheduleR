'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    config = require('../../config/config'),
    path = require('path');

/**
 * Create a Upload
 */
exports.create = function (req, res, next) {
    console.log(888,req.body, config);
    var data = _.pick(req.body, 'type'),
        uploadPath = path.normalize(config.uploadDir),
        file = req.files.file;

    console.log('uploaded: ' + file.name); //original name (ie: sunset.png)
    console.log('upload renamed to: ' + file.path); //tmp path (ie: /tmp/12345-xyaz.png)
    console.log('uploaded to: ' + uploadPath); //uploads directory: (ie: /home/user/data/uploads)

    res.jsonp({
        filename: file.path
    });
};