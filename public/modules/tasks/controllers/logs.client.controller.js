'use strict';

angular.module('tasks').controller('LogsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Tasks', 'Logs',
	function($scope, $stateParams, $location, Authentication, Tasks, Logs ) {
		// Logs controller logic
		// ...
		

		// Find existing Task
		$scope.findOne = function() {

			$scope.task = Tasks.get({
				taskId: $stateParams.taskId
			});

			// clean up array return (should be object) 
			$scope.log = Logs.get({
				taskId: $stateParams.taskId,
				logId: $stateParams.logId
			}); 





		};
	}
]);