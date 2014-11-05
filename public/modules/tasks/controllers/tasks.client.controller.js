'use strict';



// Tasks controller
angular.module('tasks').controller('TasksController', ['$scope', '$stateParams', '$location', 'Authentication', 'Tasks', 'LogsArray',
	function($scope, $stateParams, $location, Authentication, Tasks, Logs ) {
		$scope.authentication = Authentication;
		$scope.enabled = true;




		// Create new Task
		$scope.create = function() {
			// Create new Task object

			var task = new Tasks ({
				name: this.name,
				description: this.description,
				enabled: this.enabled,
				cron: this.cron,
				filename: this.filename,
				arguments: this.arguments

			});

			// Redirect after save
			task.$save(function(response) {
				$location.path('tasks/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Task
		$scope.remove = function( task ) {
			if ( task ) { task.$remove();

				for (var i in $scope.tasks ) {
					if ($scope.tasks [i] === task ) {
						$scope.tasks.splice(i, 1);
					}
				}
			} else {
				$scope.task.$remove(function() {
					$location.path('tasks');
				});
			}
		};

		// Update existing Task
		$scope.update = function() {
			var task = $scope.task ;

			task.$update(function() {
				$location.path('tasks/' + task._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Tasks
		$scope.find = function() {
			$scope.tasks = Tasks.query();
		};

		// Find existing Task
		$scope.findOne = function() {

			$scope.task = Tasks.get({
				taskId: $stateParams.taskId
			});

			$scope.logs = Logs.get({
				taskId: $stateParams.taskId
			});



		};
	}
]);
