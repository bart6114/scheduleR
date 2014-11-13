'use strict';

angular.module('users').controller('InviteController', ['$scope', '$http', '$location', 'Users', 'Authentication',
    function($scope, $http, $location, Users, Authentication) {
        $scope.user = Authentication.user;

        // If user is not signed in then redirect back home
        if (!$scope.user) $location.path('/');

        $scope.invite = function() {
            $http.post('/auth/invite', $scope.credentials).success(function(response) {

                // And redirect to the index page
                $location.path('/');
            }).error(function(response) {
                $scope.error = response.message;
            });
        };
    }
]);
