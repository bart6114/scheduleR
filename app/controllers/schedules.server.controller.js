'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Schedule = mongoose.model('Schedule'),
	_ = require('lodash');

/**
 * Create a Schedule
 */
exports.create = function(req, res) {
	var schedule = new Schedule(req.body);
	schedule.user = req.user;

	schedule.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(schedule);
		}
	});
};

/**
 * Show the current Schedule
 */
exports.read = function(req, res) {
	res.jsonp(req.schedule);
};

/**
 * Update a Schedule
 */
exports.update = function(req, res) {
	var schedule = req.schedule ;

	schedule = _.extend(schedule , req.body);

	schedule.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(schedule);
		}
	});
};

/**
 * Delete an Schedule
 */
exports.delete = function(req, res) {
	var schedule = req.schedule ;

	schedule.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(schedule);
		}
	});
};

/**
 * List of Schedules
 */
exports.list = function(req, res) { Schedule.find().sort('-created').populate('user', 'displayName').exec(function(err, schedules) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(schedules);
		}
	});
};

/**
 * Schedule middleware
 */
exports.scheduleByID = function(req, res, next, id) { Schedule.findById(id).populate('user', 'displayName').exec(function(err, schedule) {
		if (err) return next(err);
		if (! schedule) return next(new Error('Failed to load Schedule ' + id));
		req.schedule = schedule ;
		next();
	});
};

/**
 * Schedule authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.schedule.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};