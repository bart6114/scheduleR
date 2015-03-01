'use strict';

var config = require('../../config/config'),
    shinyAppList = require('../helpers/start.shinyapp.server'),
    taskList = require('../helpers/start.task.server.js'),
    reportList = require('../helpers/start.report.server.js'),
    request = require('request');


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

    var versionUrl = 'https://raw.githubusercontent.com/Bart6114/scheduleR/master/package.json';

    request({
        url: versionUrl,
        json: true
    }, function (error, response, body) {
        var latestVersion;
        if (!error && response.statusCode === 200) {
            latestVersion = body.version;
        }

        res.jsonp({
            currentVersion: config.appVersion,
            latestVersion: latestVersion
        });

    });


};


exports.stats = function(req, res) {
    var numberOfRunningApps = shinyAppList.numberOfRunningApps(),
        numberOfEnabledTasks = taskList.numberOfEnabledTasks(),
        numberOfEnabledReports = reportList.numberOfEnabledReports();


    res.jsonp({
        apps: numberOfRunningApps,
        tasks: numberOfEnabledTasks,
        reports: numberOfEnabledReports
    });



};
