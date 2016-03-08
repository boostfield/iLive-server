'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$http', '$location', 'Authentication',
    function ($scope, $http, $httpProvider, $location, Authentication) {
        $scope.authentication = Authentication;

        // If user is signed in then redirect back home
        if ($scope.authentication.user) $location.path('/');

        $scope.signup = function () {
            $http.post('/auth/signup', $scope.credentials).success(function (response) {
                // If successful we assign the response to the global user model
                $scope.authentication.user = response.user;

                // And redirect to the index page
                $location.path('/');
            }).error(function (response) {
                $scope.error = response.message;
            });
        };

        $scope.signin = function () {
            $http.post('/auth/signin-web', $scope.credentials).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                if (response.statusCode !== 0) {
                    $scope.error = response.message;
                } else {
                    $scope.authentication.user = response.user;
                    if(response.user.roles.indexOf('tenant') !== -1){
                        return $location.path('/my-activity-list');
                    }
                    $location.path('/');
                }

            });
        };
    }
]);
