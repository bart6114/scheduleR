'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus', '$http', 
		function ($scope, Authentication, Menus, $http) {
			$scope.authentication = Authentication;
			$scope.isCollapsed = false;
			$scope.menu = Menus.getMenu('topbar');
			
			$http.get('/users/count').success(function(response) {
				$scope.noUsers = (response.count === 0);
			});

			$scope.toggleCollapsibleMenu = function () {
				$scope.isCollapsed = !$scope.isCollapsed;
			};

			// Collapsing the menu after navigation
			$scope.$on('$stateChangeSuccess', function () {
				$scope.isCollapsed = false;
			});
		}
	]);
