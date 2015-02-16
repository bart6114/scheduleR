'use strict';

//Shiny apps service used to communicate Shiny apps REST endpoints
angular.module('shiny-apps').factory('ShinyApps', ['$resource',
	function($resource) {
		return $resource('shiny-apps/:shinyAppId', { shinyAppId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);