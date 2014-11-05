'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var logs = require('../../app/controllers/logs');

	app.route('/tasks/:taskId/logs')
		.get(logs.list);

	app.route('/tasks/:taskId/logs/:logId')
		.get(logs.read);

	// Finish by binding the Task middleware
	app.param('logId', logs.logByID);
};
