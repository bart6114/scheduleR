'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var shinyApps = require('../../app/controllers/shiny-apps.server.controller');

	// Shiny apps Routes
	app.route('/shiny-apps')
		.get(users.requiresLogin, shinyApps.list)
		.post(users.requiresLogin, shinyApps.create);

	app.route('/shiny-apps/:shinyAppId')
		.get(shinyApps.read)
		.put(users.requiresLogin, shinyApps.update)
		.delete(users.requiresLogin, shinyApps.delete);

		app.route('/shiny-apps/:shinyAppId/start')
		.post(users.requiresLogin, shinyApps.startApp);

		app.route('/shiny-apps/:shinyAppId/stop')
		.post(users.requiresLogin, shinyApps.stopApp);


		// Access running shiny apps
		app.route('/app/:shinyAppUrlSuffix')
		.get(shinyApps.gotoApp);


	// Finish by binding the Shiny app middleware
	app.param('shinyAppId', shinyApps.shinyAppByID);
};
