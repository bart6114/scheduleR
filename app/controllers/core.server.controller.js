'use strict';

var config = require('../../config/config'),
    shinyAppList = require('../helpers/start.shinyapp.server'),
    taskList = require('../helpers/start.task.server.js');


/**
 * Module dependencies.
 */

exports.index = function(req, res) {
    res.render('index', {
        user: req.user || null,
        appVersion: config.appVersion
    });
};

/**
 * App version
 */
exports.version = function(req, res) {
    res.jsonp(config.appVersion);
};


exports.stats = function(req, res) {
    var numberOfRunningApps = shinyAppList.numberOfRunningApps(),
        numberOfEnabledTasks = taskList.numberOfEnabledTasks();		

    res.jsonp({
        apps: numberOfRunningApps,
        tasks: numberOfEnabledTasks
    });
};
