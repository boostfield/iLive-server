'use strict';

// Cities controller
angular.module('areas').controller('AreasController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Cities', 'Countries',
    function ($scope, $http, $stateParams, $location, Authentication, Cities, Countries) {
        $scope.authentication = Authentication;

        $scope.newArea = {};
        // Create new areas
        $scope.create = function () {
            $http.post('/areas', {
                area: $scope.newArea
            }).success(function (data) {
                if(data.statusCode===0) {
                    window.alert('创建成功');
                    $location.path('cities/'+ $scope.newArea.city);
                }else{
                    window.alert(data.message);
                }
            });

        };

        $scope.getCountries = function () {
            Countries.get().$promise.then(function (result) {
                $scope.countries = result.countries;
            });
        };

        $scope.getProvinces = function () {
            $http.get('countries/' + this.country + '/provinces').success(function (data) {
                $scope.provinces = data.provinces;
            });
        };

        $scope.getCities = function () {
            $http.get('provinces/' +  $scope.newArea.province + '/cities').success(function (data) {
                $scope.cities = data.cities;
            });
        };

    }
]);
