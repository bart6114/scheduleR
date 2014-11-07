'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Task = mongoose.model('Task'),
	Log = mongoose.model('Log'),
	_ = require('lodash'),
	async = require('async');

/**
 * Create a Task
 */
exports.create = function(req, res) {
	var task = new Task(req.body);
	task.user = req.user;

	task.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(task);
		}
	});
};

/**
 * Show the current Task
 */
exports.read = function(req, res) {
	res.jsonp(req.task);
};

/**
 * Update a Task
 */
exports.update = function(req, res) {
	var task = req.task ;

	task = _.extend(task , req.body);

	task.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(task);
		}
	});
};

/**
 * Delete an Task
 */
exports.delete = function(req, res) {
	var task = req.task ;

	task.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(task);
		}
	});
};

/**
 * List of Tasks
 */

exports.list = function(req, res) {
	Task.find()
		.sort('-created')
		.populate('user', 'displayName')
		.exec(function(err, tasks) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {

				async.map(tasks, function(task, callback) {
					Log.findOne()
						.where({'task': task._id})
						.sort({'created': -1})
						.exec(function(err, log) {
							if(log) task.success = log.success;
							callback(null, task.toObject());
						});

				}, function(err, results){
					console.log(results);
					res.jsonp(results);
				});

			}
		});
};

/**
 * Task middleware
 */
exports.taskByID = function(req, res, next, id) { Task.findById(id).populate('user', 'displayName').exec(function(err, task) {
	if (err) return next(err);
	if (! task) return next(new Error('Failed to load Task ' + id));
	req.task = task ;
	next();
});
};

/**
 * Task authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.task.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
