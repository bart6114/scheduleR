'use strict';

var config = require('../../config/config');

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


