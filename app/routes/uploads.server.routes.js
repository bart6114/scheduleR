'use strict';

module.exports = function(app) {
	// Routing logic   
	// ...
	var users = require('../../app/controllers/users');
	var uploads = require('../../app/controllers/uploads');

	app.route('/uploads')
		.post(users.requiresLogin, uploads.create);

};