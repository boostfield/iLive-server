'use strict';

// Scenic areas controller
angular.module('scenic-areas').controller('ScenicAreasController', ['$scope', '$stateParams', '$location', '$http', 'Authentication', 'ScenicAreas',
    function ($scope, $stateParams, $location, $http, Authentication, ScenicAreas) {
        $scope.authentication = Authentication;
        $scope.cityToAdd = {};
        $scope.cityToUpdate = {};
        //cities 用于前端显示
        $scope.citiesInArea = [];

        $scope.getProvinces = function () {
            $http.get('countries/551115cea6ab3f760913b2e5/provinces').success(function (data) {
                $scope.provinces = data.provinces;
            });
        };
        $scope.getCities = function (provinceId) {
            $http.get('provinces/' + provinceId + '/cities').success(function (data) {
                $scope.cities = data.cities;
            });
        };
        // Create new Scenic area
        $scope.create = function () {
            // Create new Scenic area object
            var cityArray = [];
            for (var index in $scope.citiesInArea) {
                cityArray.push($scope.citiesInArea[index].id);
            }
            var scenicArea = new ScenicAreas({
                name: this.name,
                introduction: this.introduction,
                hotRating: this.hotRating,
                cities: cityArray
            });

            // Redirect after save
            scenicArea.$save(function (response) {
                $location.path('scenic-areas/' + response._id);

                // Clear form fields
                $scope.name = '';
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing Scenic area
        $scope.remove = function () {
            if ($scope.scenicAreaToDelete) {
                $http.delete('scenic-areas/' + $scope.scenicAreaToDelete._id).then(function (data) {
                    for (var i in $scope.scenicAreas) {
                        if ($scope.scenicAreas [i] === $scope.scenicAreaToDelete) {
                            $scope.scenicAreas.splice(i, 1);
                            window.alert('景区' + $scope.scenicAreaToDelete.name + '删除成功！');
                            $scope.scenicAreaToDelete = undefined;
                        }
                    }
                });
            }
        };

        // Update existing Scenic area
        $scope.update = function () {
            var scenicArea = JSON.parse(JSON.stringify($scope.scenicArea));
            var cityArray = [];
            for (var index in scenicArea.cities) {
                cityArray.push(scenicArea.cities[index].id);
            }
            scenicArea.cities = cityArray;
            $http.put('scenic-areas/' + scenicArea._id, scenicArea).success(function (data) {
                window.alert('更新成功! 😊');
            }).error(function (data) {
                $scope.error = data.message;
            });
        };

        // Find a list of Scenic areas
        $scope.find = function () {
            $http.get('scenic-areas').success(function (data) {
                $scope.scenicAreas = data.scenicAreas;
            }).error(function (err) {
                $scope.error = err.message;
            });
        };

        // Find existing Scenic area
        $scope.findOne = function () {
            $http.get('scenic-areas/' + $stateParams.scenicAreaId).success(function (data) {
                $scope.scenicArea = data.scenicArea;
            }).error(function (err) {
                $scope.error = err.message;
            });
        };

        $scope.addCity = function (updateFlag) {
            if (updateFlag === 'create' &&
                $scope.cityToAdd.selectedCity &&
                $scope.citiesInArea.indexOf($scope.cityToAdd.selectedCity) === -1) {
                $scope.citiesInArea.push($scope.cityToAdd.selectedCity);
            } else if (updateFlag === 'update' &&
                $scope.cityToUpdate.selectedCity &&
                $scope.scenicArea.cities.indexOf($scope.cityToUpdate.selectedCity) === -1) {
                $scope.scenicArea.cities.push($scope.cityToUpdate.selectedCity);
            }
        };

        $scope.removeCity = function (updateFlag, cityId) {
            var index;
            if (updateFlag === 'update') {
                for (index in $scope.scenicArea.cities) {
                    if ($scope.scenicArea.cities[index].id === cityId) {
                        $scope.scenicArea.cities.splice(index, 1);
                    }
                }
            } else if (updateFlag === 'create') {
                for (index in $scope.citiesInArea) {
                    if ($scope.citiesInArea[index].id === cityId) {
                        $scope.citiesInArea.splice(index, 1);
                    }
                }
            }
        };

        $scope.setScenicAreaToDelete = function (scenicArea) {
            $scope.scenicAreaToDelete = scenicArea;
        };
    }
]);
