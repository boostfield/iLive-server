/**
 * Created by wangerbing on 15/12/17.
 */

'use strict';

angular.module('user-management').controller('UserOperationRecordersController', ['$scope', '$stateParams',
    '$location', '$http', 'Authentication',
    function ($scope, $stateParams, $location, $http, Authentication) {
        $scope.authentication = Authentication;
        $scope.beginDate = new Date();
        $scope.endDate = new Date();
        $scope.showDialog = false;
        $scope.userOperationRecorders = '';

        $scope.open = function ($event) {  // 创建open方法 。 下面默认行为并将opened 设为true
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };
        $scope.disabled = function (date, mode) {
            return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
        };
        $scope.dateOptions = {
            formatYear: 'yyyy',
            formatMonth: 'MM',
            formatDay: 'dd',
            startingDay: 1
        };
        $scope.format = 'yyyy/MM/dd';  // 将formats的第0项设为默认显示格式
        $scope.findUserOperationRecorders = function () {
            if ((new Date($scope.beginDate)).getTime() > (new Date($scope.endDate)).getTime()) {
                window.alert('查询时间有问题哦~');
            }else {
                $scope.showDialog = true;
                $http.get('/user-operation-recorders', {
                    params: {
                        beginDate: $scope.beginDate,
                        endDate: $scope.endDate
                    }
                }).success(function (result) {
                    $scope.userOperationRecorders = [{
                        'date': $scope.beginDate.toLocaleDateString() + ' 到 ' + $scope.endDate.toLocaleDateString() + ' :',
                        'newDownloadCount': result.newDownloadCount ? result.newDownloadCount : 0,
                        'newUserCount': result.newUserCount ? result.newUserCount : 0,
                        'starTaskCount': result.starTaskCount,
                        'finishTaskCount': result.finishTaskCount
                    }];
                }).error(function (data) {
                    window.alert(data.message);
                    $scope.error = data.message;
                });
            }

        };


    }
]);
