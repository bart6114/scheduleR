'use strict';

//Schedules service used to communicate Schedules REST endpoints
angular.module('schedules').factory('Schedules', ['$resource',
	function($resource) {
		return $resource('schedules/:scheduleId', { scheduleId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);