'use strict';

angular.module('logs').controller('LogsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Tasks', 'Logs',
	function($scope, $stateParams, $location, Authentication, Tasks, Logs ) {
		// Logs controller logic
		// ...
		

		// Find existing Task
		$scope.findOne = function() {
            console.log(332);

			$scope.log = Logs.get({
				objectId: $stateParams.objectId,
				logId: $stateParams.logId
			}); 

		};

        $scope.previousPage = function() {
            window.history.back()
        };
	}
]);
