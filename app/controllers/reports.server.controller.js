'use strict';



/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors'),
    Report = mongoose.model('Report'),
    Log = mongoose.model('Log'),
    _ = require('lodash'),
    async = require('async'),
    reportList = require('../helpers/start.report.server.js');

/**
 * Create a Report
 */
exports.create = function(req, res) {
    var report = new Report(req.body);
    report.user = req.user;

    report.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(report);
            if(report.enabled) {
                reportList.addReportAndStart(report);
            }
        }
    });
};

/**
 * Show the current Report
 */
exports.read = function(req, res) {
    res.jsonp(req.report);
};

/**
 * Run a Report once
 */
exports.runOnce = function(req, res){
    var report = req.report;
    reportList.runReportOnce(report);
    res.jsonp({});

};


/**
 * Update a Report
 */
exports.update = function(req, res) {
    var report = req.report ;

    report = _.extend(report , req.body);

    report.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            reportList.removeReport(report);
            if(report.enabled) {
                reportList.addReportAndStart(report);
            }

            res.jsonp(report);
        }
    });
};

/**
 * Delete an Report
 */
exports.delete = function(req, res) {
    var report = req.report ;

    report.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {

            reportList.removeReport(report);
            res.jsonp(report);
        }
    });
};

/**
 * List of Reports
 */

exports.list = function(req, res) {
    Report.find()
        .sort('name')
        .populate('user', 'displayName')
        .exec(function(err, reports) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {

                async.map(reports, function(report, callback) {
                    Log.findOne()
                        .where({'task': report._id})
                        .sort({ $natural: -1 })
                        .limit(1)
                        .exec(function(err, log) {

                            if(log) report.success = log.success;
                            else report.success = true; // no log found
                            callback(null, report.toObject());
                        });

                }, function(err, results){

                    res.jsonp(results);
                });

            }
        });
};

/**
 * Report middleware
 */
exports.reportByID = function(req, res, next, id) { Report.findById(id).populate('user', 'displayName').exec(function(err, report) {
    if (err) return next(err);
    if (! report) return next(new Error('Failed to load Report ' + id));
    req.report = report ;
    next();
});
};

/**
 * Report authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (!req.user.id) {
        return res.status(403).send('User is not authorized');
    }
    next();
};
