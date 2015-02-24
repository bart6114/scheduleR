'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    errorHandler = require('./errors'),
    Task = mongoose.model('Task'),
    Log = mongoose.model('Log');



/**
 * List of Logs
 */
exports.list = function(req, res) {

    var startAt = parseInt(req.query.startAt);
    var maxNumberOfLogs = parseInt(req.query.maxNumberOfLogs);

    Log.find({
        'task': req.param("objectId")
    })
        .sort({'_id': -1})
        .skip(startAt)
        .limit(maxNumberOfLogs)
        .exec(function(err, logs) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(logs);
            }
        });


    //if(req.query.lastLogId === undefined ){
    //
    //Log.find({
    //    'task': req.task._id
    //  })
    //  .limit(10)
    //  .sort({'_id': -1})
    //  .exec(function(err, logs) {
    //    if (err) {
    //      return res.status(400).send({
    //        message: errorHandler.getErrorMessage(err)
    //      });
    //    } else {
    //      res.jsonp(logs);
    //    }
    //  });
    //} else {
    //  Log.find({
    //    'task': req.task._id,
    //    '_id': {'$lt': req.query.lastLogId}
    //  })
    //  .limit(10)
    //  .sort({'_id': -1})
    //  .exec(function(err, logs) {
    //    if (err) {
    //      return res.status(400).send({
    //        message: errorHandler.getErrorMessage(err)
    //      });
    //    } else {
    //      res.jsonp(logs);
    //    }
    //  });
    //
    //
    //}
};

/**
 * Show the current log
 */
exports.read = function(req, res) {
    res.jsonp(req.log);
};


/**
 * Log middleware
 */
exports.logByID = function(req, res, next, id) {
    Log.findById(id).exec(function(err, log) {
        if (err) return next(err);
        if (!log) return next(new Error('Failed to load Log ' + id));

        req.log = log;
        next();
    });
};
