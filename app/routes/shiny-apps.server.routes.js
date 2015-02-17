'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var shinyApps = require('../../app/controllers/shiny-apps.server.controller');

	// Shiny apps Routes
	app.route('/shiny-apps')
		.get(shinyApps.list)
		.post(users.requiresLogin, shinyApps.create);

	app.route('/shiny-apps/:shinyAppId')
		.get(shinyApps.read)
		.put(users.requiresLogin, shinyApps.hasAuthorization, shinyApps.update)
		.delete(users.requiresLogin, shinyApps.hasAuthorization, shinyApps.delete);

		app.route('/shiny-apps/:shinyAppId/run')
		.post(users.requiresLogin, shinyApps.startApp);

	// Finish by binding the Shiny app middleware
	app.param('shinyAppId', shinyApps.shinyAppByID);
};
