'use strict';


angular.module('core').controller('HomeController', ['$scope', '$http', '$timeout', 'Authentication',
	function($scope, $http, $timeout, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.XKCDurl = '#';

		$http.jsonp('http://dynamic.xkcd.com/api-0/jsonp/comic/?callback=JSON_CALLBACK')
			.success(function(data, status, headers, config) {
				$timeout(function() {
					$scope.XKCDurl = data.img;
				});
			});






	}
]);
