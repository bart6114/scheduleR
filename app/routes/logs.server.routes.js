'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var logs = require('../../app/controllers/logs');

	//app.route('/tasks/:taskId/logs')
	//	.get(users.requiresLogin, logs.list);

    app.route('/logs/list/:objectId')
        .get(users.requiresLogin, logs.list);

	app.route('/logs/specific/:logId')
		.get(users.requiresLogin, logs.read);

	// Finish by binding the Task middleware
	app.param('logId', logs.logByID);

};
