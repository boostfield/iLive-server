'use strict';

// Countries controller
angular.module('countries').controller('CountriesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Countries',
    function ($scope, $stateParams, $location, Authentication, Countries) {
        $scope.authentication = Authentication;

        // Create new Country
        $scope.create = function () {
            // Create new Country object
            var country = new Countries({
                name: this.name
            });

            // Redirect after save
            country.$save(function (response) {
                $location.path('countries/' + response._id);

                // Clear form fields
                $scope.name = '';
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing Country
        $scope.remove = function (country) {
            if (country) {
                country.$remove();

                for (var i in $scope.countries) {
                    if ($scope.countries [i] === country) {
                        $scope.countries.splice(i, 1);
                    }
                }
            } else {
                $scope.country.$remove(function () {
                    $location.path('countries');
                });
            }
        };

        // Update existing Country
        $scope.update = function () {
            var country = $scope.country;

            country.$update(function () {
                $location.path('countries/' + country._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Countries
        $scope.find = function () {
            $scope.countries = Countries.query();
        };

        // Find existing Country
        $scope.findOne = function () {
            $scope.country = Countries.get({
                countryId: $stateParams.countryId
            });
        };
    }
]);
