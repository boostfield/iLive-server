'use strict';
angular.module('activity').controller('ActivityController', ['$scope', '$stateParams', '$location',
    'Authentication', 'Tasks', 'TasksVerify', 'TasksGrant', '$http',
    function ($scope, $stateParams, $location, Authentication, Tasks, TaskVerify, TaskGrant, $http) {
        $scope.authentication = Authentication;

        $scope.before = function () {
            $http.get('/quota-recorders/tasks/' + $stateParams.activityId + '/auth-tenant')
                .success(function (date) {
                    if (date.result === true) {
                        $scope.quotaRecordFlag = '您的申请已经发送';
                    }
                }).error(function (data) {
                    window.alert(data.message);
                });
        };

        $scope.findMyTasks = function () {
            Tasks.get({belongToUser: $scope.authentication.user.id, pageSize: 500}).$promise.then(function (result) {
                if (result.statusCode === 0) {
                    $scope.tasks = result.tasks;
                } else {
                    $scope.error = result.message;
                    window.alert(result.message);
                }
            });
        };

        $scope.findOne = function () {
            Tasks.get({taskId: $stateParams.activityId}).$promise.then(function (result) {
                $scope.task = result.task;
            });
        };

        $scope.verifyUser = function () {
            TaskVerify.save({
                id: $stateParams.activityId,
                verifyCode: $scope.verifyCode
            }).$promise.then(
                function (result) {
                        window.alert(result.message);
                },
                function (result) {
                    window.alert(result.data.message);
                });
        };

        $scope.grantBonus = function (result) {
            TaskGrant.save({
                id: $stateParams.activityId,
                verifyCode: $scope.verifyCode,
                result: result
            }).$promise.then(
                function (result) {
                    if(result.statusCode === 0){
                        window.alert('操作成功！');
                    }else if (result.statusCode === 92000){
                        window.alert('请输入验证码！');
                    }else if(result.statusCode === 54000){
                        window.alert('验证码错误！');
                    } else {
                        window.alert(result.message);
                    }
                },
                function (result) {
                    window.alert('服务器内部错误，请稍后再试。');
                });
        };

        $scope.applyForQuota = function () {
            if (!(/^\+?[1-9][0-9]*$/).test($scope.quantity)) {
                window.alert('请输入正确的数量！');
            } else {
                $http.post('/tasks/' + $stateParams.activityId + '/apply-for-quota', {
                    quantity: $scope.quantity
                }).success(function () {
                    $scope.quotaRecordFlag = '您的申请已经发送';
                    window.alert('发送申请成功，管理员会尽快审核~');
                }).error(function (data) {
                    window.alert(data.message);
                });
            }
        };
    }
]);
