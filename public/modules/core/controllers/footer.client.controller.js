'use strict';

angular.module('core').controller('FooterController', ['$scope', 'Authentication', '$http',
	function ($scope, Authentication, $http) {
		$scope.authentication = Authentication;

		$http.get('/version')
			.success(function(data) {
                $scope.versionInfo = data;
                $scope.upToDate = parseInt(data.currentVersion.split('.').join('')) < parseInt(data.latestVersion.split('.').join('')) ? false : true;
			});
	}
]);
