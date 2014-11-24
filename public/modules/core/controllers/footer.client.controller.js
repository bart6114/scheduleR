'use strict';

angular.module('core').controller('FooterController', ['$scope', 'Authentication', '$http',
	function ($scope, Authentication, $http) {
		$scope.authentication = Authentication;

		$http.get('/version')
			.success(function(data) {
				$scope.appVersion = JSON.parse(data);
			});
	}
]);
