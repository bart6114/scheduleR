'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var logs = require('../../app/controllers/logs');

	app.route('/tasks/:taskId/logs')
		.get(logs.read)
};
