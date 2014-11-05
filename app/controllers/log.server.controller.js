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
 * Create a Log
 */
exports.create = function(req, res) {

};

/**
 * Show the current Log
 */
exports.read = function(req, res) {

};

/**
 * Update a Log
 */
exports.update = function(req, res) {

};

/**
 * Delete an Log
 */
exports.delete = function(req, res) {

};

/**
 * List of Logs
 */
exports.list = function(req, res) {

};


/**
 * Task middleware
 */
exports.logsByTaskId = function(req, res, next, id) { Log.find({'task': id}).populate('user', 'displayName').exec(function(err, logs) {
    if (err) return next(err);
    if (! logs) return next(new Error('Failed to load Logs of Task ' + id));
    req.logs = logs;
    next();
});
};
