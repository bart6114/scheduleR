'use strict';

//Setting up route
angular.module('reports').config(['$stateProvider',
	function($stateProvider) {
		// Reports state routing
		$stateProvider.
		state('listReports', {
			url: '/reports',
			templateUrl: 'modules/reports/views/list-reports.client.view.html'
		}).
		state('createReport', {
			url: '/reports/create',
			templateUrl: 'modules/reports/views/create-edit-report.client.view.html'
		}).
		state('viewReport', {
			url: '/reports/:reportId',
			templateUrl: 'modules/reports/views/view-report.client.view.html'
		}).
		state('editReport', {
			url: '/reports/:reportId/edit',
			templateUrl: 'modules/reports/views/create-edit-report.client.view.html'
		});
	}
]);