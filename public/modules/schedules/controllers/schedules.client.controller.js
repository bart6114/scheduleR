'use strict';

// Schedules controller
angular.module('schedules').controller('SchedulesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Schedules',
	function($scope, $stateParams, $location, Authentication, Schedules ) {
		$scope.authentication = Authentication;

		// Create new Schedule
		$scope.create = function() {
			// Create new Schedule object
			var schedule = new Schedules ({
				name: this.name
			});

			// Redirect after save
			schedule.$save(function(response) {
				$location.path('schedules/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Schedule
		$scope.remove = function( schedule ) {
			if ( schedule ) { schedule.$remove();

				for (var i in $scope.schedules ) {
					if ($scope.schedules [i] === schedule ) {
						$scope.schedules.splice(i, 1);
					}
				}
			} else {
				$scope.schedule.$remove(function() {
					$location.path('schedules');
				});
			}
		};

		// Update existing Schedule
		$scope.update = function() {
			var schedule = $scope.schedule ;

			schedule.$update(function() {
				$location.path('schedules/' + schedule._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Schedules
		$scope.find = function() {
			$scope.schedules = Schedules.query();
		};

		// Find existing Schedule
		$scope.findOne = function() {
			$scope.schedule = Schedules.get({ 
				scheduleId: $stateParams.scheduleId
			});
		};
	}
]);