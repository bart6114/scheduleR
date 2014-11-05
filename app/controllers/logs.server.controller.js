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
	Log.find({'task': req.task._id}).sort('-created').exec(function(err, logs) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(logs);
		}
	});
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
exports.logByID = function(req, res, next, id) { ; Log.findById(id).exec(function(err, log) {
	if (err) return next(err);
	if (! log) return next(new Error('Failed to load Log ' + id));

	req.log = log ;
	next();
});
};
