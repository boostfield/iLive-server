'use strict';

angular.module('quota-recorders').controller('CheckQuotaRecordersController', ['$scope', '$stateParams',
    '$location', '$http', 'Authentication', 'QuotaRecorders',
    function ($scope, $stateParams, $location, $http, Authentication, QuotaRecorders) {
        $scope.authentication = Authentication;
        $scope.itemsPerPage = 10;

        $scope.totalUncheckedItems = 0;
        $scope.uncheckedCurrentPage = 0;
        $scope.uncheckedQuotaRecorders = [];

        $scope.totalCheckedItems = 0;
        $scope.checkedCurrentPage = 0;
        $scope.checkedQuotaRecorders = [];

        $scope.totalDeniedItems = 0;
        $scope.deniedCurrentPage = 0;
        $scope.deniedQuotaRecorders = [];

        $scope.getUncheckedList = function () {
            $http.get('quota-recorders', {
                params: {
                    result: 'unchecked'
                }
            })
                .success(function (data) {
                    $scope.uncheckedQuotaRecorders = data.quotaRecorders;
                    $scope.totalUncheckedItems = data.total;
                }).error(function (data) {
                    $scope.error = data.message;
                });
        };

        $scope.uncheckedPageChanged = function () {
            $http.get('quota-recorders', {
                params: {
                    result: 'unchecked',
                    pageSize: $scope.itemsPerPage,
                    pageNumber: $scope.uncheckedCurrentPage - 1
                }
            })
                .success(function (data) {
                    $scope.uncheckedQuotaRecorders = data.quotaRecorders;
                    $scope.totalUncheckedItems = data.total;
                }).error(function (data) {
                    $scope.error = data.message;
                });
        };

        $scope.getCheckedList = function () {
            $http.get('quota-recorders', {
                params: {
                    result: 'pass'
                }
            })
                .success(function (data) {
                    $scope.checkedQuotaRecorders = data.quotaRecorders;
                    $scope.totalCheckedItems = data.total;
                }).error(function (data) {
                    $scope.error = data.message;
                });
        };

        $scope.checkedPageChanged = function () {
            $http.get('quota-recorders', {
                params: {
                    result: 'pass',
                    pageSize: $scope.itemsPerPage,
                    pageNumber: $scope.checkedCurrentPage - 1
                }
            }).success(function (data) {
                $scope.checkedQuotaRecorders = data.quotaRecorders;
                $scope.totalCheckedItems = data.total;
            }).error(function (data) {
                $scope.error = data.message;
            });
        };

        $scope.getDeniedList = function () {
            $http.get('quota-recorders', {
                params: {
                    result: 'deny'
                }
            }).success(function (data) {
                $scope.deniedQuotaRecorders = data.quotaRecorders;
                $scope.totalDeniedItems = data.total;
            }).error(function (data) {
                $scope.error = data.message;
            });
        };

        $scope.deniedPageChanged = function () {
            $http.get('quota-recorders', {
                params: {
                    result: 'deny',
                    pageSize: $scope.itemsPerPage,
                    pageNumber: $scope.deniedCurrentPage - 1
                }
            }).success(function (data) {
                $scope.deniedQuotaRecorders = data.quotaRecorders;
                $scope.totalDeniedItems = data.total;
            }).error(function (data) {
                $scope.error = data.message;
            });
        };

    }
]);

