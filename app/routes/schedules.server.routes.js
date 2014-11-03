'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var schedules = require('../../app/controllers/schedules');

	// Schedules Routes
	app.route('/schedules')
		.get(schedules.list)
		.post(users.requiresLogin, schedules.create);

	app.route('/schedules/:scheduleId')
		.get(schedules.read)
		.put(users.requiresLogin, schedules.hasAuthorization, schedules.update)
		.delete(users.requiresLogin, schedules.hasAuthorization, schedules.delete);

	// Finish by binding the Schedule middleware
	app.param('scheduleId', schedules.scheduleByID);
};