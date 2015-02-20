'use strict';

//Setting up route
angular.module('shiny-apps').config(['$stateProvider',
	function($stateProvider) {
		// Shiny apps state routing
		$stateProvider.
		state('listShinyApps', {
			url: '/shiny-apps',
			templateUrl: 'modules/shiny-apps/views/list-shiny-apps.client.view.html'
		}).
		state('createShinyApp', {
			url: '/shiny-apps/create',
			templateUrl: 'modules/shiny-apps/views/create-edit-shiny-app.client.view.html'
		}).
		state('viewShinyApp', {
			url: '/shiny-apps/:shinyAppId',
			templateUrl: 'modules/shiny-apps/views/view-shiny-app.client.view.html'
		}).
		state('editShinyApp', {
			url: '/shiny-apps/:shinyAppId/edit',
			templateUrl: 'modules/shiny-apps/views/create-edit-shiny-app.client.view.html'
		});
	}
]);
