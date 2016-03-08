'use strict';

// Scenic spots controller
angular.module('quota-recorders').controller('QuotaRecordersController', ['$scope', '$stateParams',
    '$location', '$http', 'Authentication', 'QuotaRecorders',
    function ($scope, $stateParams, $location, $http, Authentication, QuotaRecorders) {
        $scope.authentication = Authentication;
        $scope.itemsPerPage = 10;
        $scope.currentPage = 0;


        // Find a list of
        $scope.find = function () {
            $http.get('quota-recorders')
                .success(function (data) {
                    $scope.quotaRecorders = data.quotaRecorders;
                    $scope.totalItems = data.total;
                }).error(function (data) {
                    $scope.error = data.message;
                });
        };
        $scope.pageChanged = function () {
            $http.get('quota-recorders', {
                params: {
                    pageSize: $scope.itemsPerPage,
                    pageNumber: $scope.currentPage - 1
                }
            })
                .success(function (data) {
                    $scope.quotaRecorders = data.quotaRecorders;
                    $scope.totalItems = data.total;
                }).error(function (data) {
                    $scope.error = data.message;
                });
        };

        // Find existing
        $scope.findOne = function () {
            QuotaRecorders.get({
                quotaRecorderId: $stateParams.quotaRecorderId
            }).$promise.then(function (result) {
                    $scope.quotaRecorder = result;
                });
        };

        $scope.checkQuotaRecorder = function (result) {
            if (result === 'deny' && !$scope.quotaRecorder.message) {
                window.alert('请填写拒绝的理由');
            } else {
                $http.post('/quota-recorders/' + $stateParams.quotaRecorderId + '/handle-request',
                    {
                        result: result,
                        message: $scope.quotaRecorder.message
                    }
                )
                    .success(function (data) {
                        if (data.statusCode === 0) {
                            window.alert('成功! 😊');
                            location.reload();
                        } else {
                            $scope.error = result.message;
                        }
                    }).error(function (data) {
                        $scope.error = data.message;
                    });
            }
        };

    }
]);
