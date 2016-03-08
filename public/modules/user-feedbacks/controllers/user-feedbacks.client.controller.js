'use strict';

// User feedbacks controller
angular.module('user-feedbacks').controller('UserFeedbacksController', ['$scope', '$stateParams', '$location', '$http', 'Authentication', 'UserFeedbacks',
    function ($scope, $stateParams, $location, $http, Authentication, UserFeedbacks) {
        $scope.authentication = Authentication;

        // Create new User feedback
        $scope.create = function () {
            // Create new User feedback object
            var userFeedback = new UserFeedbacks({
                name: this.name
            });

            // Redirect after save
            userFeedback.$save(function (response) {
                $location.path('user-feedbacks/' + response._id);

                // Clear form fields
                $scope.name = '';
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing User feedback
        $scope.remove = function (userFeedback) {
            if (userFeedback) {
                userFeedback.$remove();
                for (var i in $scope.userFeedbacks) {
                    if ($scope.userFeedbacks [i] === userFeedback) {
                        $scope.userFeedbacks.splice(i, 1);
                    }
                }
            } else {
                $scope.userFeedback.$remove(function () {
                    $location.path('user-feedbacks');
                });
            }
        };

        // Update existing User feedback
        $scope.update = function () {
            var userFeedback = $scope.userFeedback;

            userFeedback.$update(function () {
                $location.path('user-feedbacks/' + userFeedback._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };
        $scope.handleFeedBack = function () {
            $scope.userFeedback.handleTime = Date.now();
            $scope.userFeedback.handler = $scope.authentication.user.id;
            $scope.userFeedback.user = $scope.userFeedback.user.id;
            $scope.userFeedback.checked = true;
            $http.put('/user-feedbacks/' + $scope.userFeedback._id, $scope.userFeedback).success(function (data) {
                if (data.statusCode === 0) {
                    window.alert('更新成功! 😊');
                    location.reload();
                }
            }).error(function (data) {
                window.alert(data.message);
                $scope.error = data.message;
            });
        };

        // Find a list of User feedbacks
        $scope.find = function () {
            $scope.userFeedbacks = UserFeedbacks.query();
        };

        // Find existing User feedback
        $scope.findOne = function () {
            $scope.userFeedback = UserFeedbacks.get({
                userFeedbackId: $stateParams.userFeedbackId
            });
        };
        //反馈列表：分页，分审核/未审核
        $scope.itemsPerPage = 12;

        $scope.totalUncheckedItems = 0;
        $scope.uncheckedCurrentPage = 0;
        $scope.uncheckedScenicSpots = [];

        $scope.totalCheckedItems = 0;
        $scope.checkedCurrentPage = 0;
        $scope.checkedScenicSpots = [];

        $scope.getUncheckedList = function () {
            $http.get('/user-feedbacks', {
                params: {
                    checked: 'false'
                }
            }).success(function (data) {
                console.dir(data.userFeedbacks);
                $scope.uncheckedUserFeedbacks = data.userFeedbacks;
                $scope.totalUncheckedItems = data.total;
            }).error(function (data) {
                $scope.error = data.message;
            });
        };

        $scope.uncheckedPageChanged = function () {
            $http.get('/user-feedbacks', {
                params: {
                    checked: 'false',
                    pageSize: $scope.itemsPerPage,
                    pageNumber: $scope.uncheckedCurrentPage - 1
                }
            }).success(function (data) {
                $scope.uncheckedUserFeedbacks = data.userFeedbacks;
                $scope.totalUncheckedItems = data.total;
            }).error(function (data) {
                $scope.error = data.message;
            });
        };

        $scope.getCheckedList = function () {
            $http.get('/user-feedbacks', {
                params: {
                    checked: 'true'
                }
            }).success(function (data) {
                $scope.checkedUserFeedbacks = data.userFeedbacks;
                $scope.totalCheckedItems = data.total;
            }).error(function (data) {
                $scope.error = data.message;
            });
        };

        $scope.checkedPageChanged = function () {
            $http.get('/user-feedbacks', {
                params: {
                    checked: 'true',
                    pageSize: $scope.itemsPerPage,
                    pageNumber: $scope.checkedCurrentPage - 1
                }
            }).success(function (data) {
                $scope.checkedUserFeedbacks = data.userFeedbacks;
                $scope.totalCheckedItems = data.total;
            }).error(function (data) {
                $scope.error = data.message;
            });
        };
    }
]);
