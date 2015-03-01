'use strict';

//Setting up route
angular.module('logs').config(['$stateProvider',
	function($stateProvider) {
		// Logs state routing
		$stateProvider.
		state('logs', {
			url: '/logs/specific/:logId',
			templateUrl: 'modules/logs/views/view-log.client.view.html'
		});
	}
]);