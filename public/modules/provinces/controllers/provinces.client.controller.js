'use strict';

// Provinces controller
angular.module('provinces').controller('ProvincesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Provinces',
    function ($scope, $stateParams, $location, Authentication, Provinces) {
        $scope.authentication = Authentication;

        // Create new Province
        $scope.create = function () {
            // Create new Province object
            var province = new Provinces({
                name: this.name
            });

            // Redirect after save
            province.$save(function (response) {
                $location.path('provinces/' + response._id);

                // Clear form fields
                $scope.name = '';
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing Province
        $scope.remove = function (province) {
            if (province) {
                province.$remove();

                for (var i in $scope.provinces) {
                    if ($scope.provinces [i] === province) {
                        $scope.provinces.splice(i, 1);
                    }
                }
            } else {
                $scope.province.$remove(function () {
                    $location.path('provinces');
                });
            }
        };

        // Update existing Province
        $scope.update = function () {
            var province = $scope.province;

            province.$update(function () {
                $location.path('provinces/' + province._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Provinces
        $scope.find = function () {
            $scope.provinces = Provinces.query();
        };

        // Find existing Province
        $scope.findOne = function () {
            $scope.province = Provinces.get({
                provinceId: $stateParams.provinceId
            });
        };
    }
]);
