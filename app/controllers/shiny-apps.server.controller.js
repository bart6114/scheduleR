'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	ShinyApp = mongoose.model('ShinyApp'),
	_ = require('lodash');

/**
 * Create a Shiny app
 */
exports.create = function(req, res) {
	var shinyApp = new ShinyApp(req.body);
	shinyApp.user = req.user;

	shinyApp.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(shinyApp);
		}
	});
};

/**
 * Show the current Shiny app
 */
exports.read = function(req, res) {
	res.jsonp(req.shinyApp);
};

/**
 * Update a Shiny app
 */
exports.update = function(req, res) {
	var shinyApp = req.shinyApp ;

	shinyApp = _.extend(shinyApp , req.body);

	shinyApp.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(shinyApp);
		}
	});
};

/**
 * Delete an Shiny app
 */
exports.delete = function(req, res) {
	var shinyApp = req.shinyApp ;

	shinyApp.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(shinyApp);
		}
	});
};

/**
 * List of Shiny apps
 */
exports.list = function(req, res) { 
	ShinyApp.find().sort('-created').populate('user', 'displayName').exec(function(err, shinyApps) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(shinyApps);
		}
	});
};

/**
 * Shiny app middleware
 */
exports.shinyAppByID = function(req, res, next, id) { 
	ShinyApp.findById(id).populate('user', 'displayName').exec(function(err, shinyApp) {
		if (err) return next(err);
		if (! shinyApp) return next(new Error('Failed to load Shiny app ' + id));
		req.shinyApp = shinyApp ;
		next();
	});
};

/**
 * Shiny app authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.shinyApp.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
