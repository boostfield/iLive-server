'use strict';

// Scenic spots controller
angular.module('user-management').controller('UserManagementController', ['$scope', '$stateParams',
    '$location', '$http', 'Authentication',
    function ($scope, $stateParams, $location, $http, Authentication) {
        $scope.authentication = Authentication;
        $scope.users = [];
        $scope.userTypes = [{name: '商户', type: 'tenant'}, {name: '数据操作员', type: 'editor'}];
        $scope.selectedUserType = 'tenant';
        //用户list的分页
        $scope.userCount = 0;
        $scope.itemsPerPage = 10;
        $scope.currentPage = 1;
        $scope.serchTenantFlag = 'false';

        //创建的景点的分页
        $scope.createdScenicSpotsCount = 0;
        $scope.createdSpotsCurrentPage = 0;

        //更新的景点的分页
        $scope.updatedScenicSpotsCount = 0;
        $scope.updatedSpotsCurrentPage = 0;

        $scope.selectedUser = {};
        $scope.credentials = {};
        //修改商户用户名
        $scope.newDisplayName = '';
        $scope.saveNewDisplayName = function (newName) {
            $http.put('/tenants/' + $scope.selectedUser.id + '/display-name', {
                newDisplayName: newName
            }).success(function (data) {
                $scope.selectedUser.displayName = newName;
            });
        };
        $scope.getAllUsers = function () {
            $http.get('users', {
                params: {
                    pageSize: $scope.itemsPerPage,
                    pageNumber: $scope.currentPage
                }
            }).success(function (data) {
                $scope.users = data.users;
                $scope.userCount = data.total;
            }).error(function (err) {
            });
        };

        $scope.getAllTenants = function () {
            $http.get('/tenants', {
                params: {
                    pageSize: $scope.itemsPerPage,
                    pageNumber: $scope.currentPage - 1
                }
            }).success(function (data) {
                $scope.users = data.users;
                $scope.userCount = data.total;
            }).error(function (err) {
            });
        };

        $scope.findOne = function () {
            $http.get('users/' + $stateParams.userId).success(function (data) {
                $scope.selectedUser = data.userInfo;
                $scope.newDisplayName = $scope.selectedUser.displayName;
                $http.get('/tasks?belongToUser=' + $scope.selectedUser.id).success(function (data) {
                    $scope.tasks = data.tasks;
                });
            });
        };

        $scope.edit = function () {

        };

        $scope.pageChanged = function () {
            $http.get('users', {
                params: {
                    pageSize: $scope.itemsPerPage,
                    pageNumber: $scope.currentPage - 1
                }
            }).success(function (data) {
                $scope.users = data.users;
                $scope.userCount = data.total;
            });
        };

        $scope.findCreatedScenicSpots = function () {
            $http.get('users/' + $stateParams.userId + '/created-scenicspots').success(function (data) {
                $scope.createdScenicSpots = data.scenicSpots;
                $scope.createdScenicSpotsCount = data.total;
            });
        };

        $scope.createdScenicSpotsPageChange = function () {
            $http.get('users/' + $stateParams.userId + '/created-scenicspots', {
                params: {
                    pageSize: $scope.itemsPerPage,
                    pageNumber: $scope.createdSpotsCurrentPage - 1
                }
            }).success(function (data) {
                $scope.createdScenicSpots = data.scenicSpots;
                $scope.createdScenicSpotsCount = data.total;
            });
        };

        $scope.findUpdatedScenicSpots = function () {
            $http.get('users/' + $stateParams.userId + '/updated-scenicspots').success(function (data) {
                $scope.updatedScenicSpots = data.scenicSpots;
                $scope.updatedScenicSpotsCount = data.total;
            });
        };

        $scope.updatedScenicSpotsPageChange = function () {
            $http.get('users/' + $stateParams.userId + '/updated-scenicspots', {
                params: {
                    pageSize: $scope.itemsPerPage,
                    pageNumber: $scope.updatedSpotsCurrentPage - 1
                }
            }).success(function (data) {
                $scope.updatedScenicSpots = data.scenicSpots;
                $scope.updatedScenicSpotsCount = data.total;
            });
        };

        $scope.tenantPageChanged = function () {
            if ($scope.serchTenantFlag === 'true') {
                $http.get('tenants/search?keyword=' + $scope.keyword, {
                    params: {
                        pageSize: $scope.itemsPerPage,
                        pageNumber: $scope.currentPage - 1
                    }
                }).success(function (data) {
                    $scope.users = data.users;
                    $scope.userCount = data.total;
                }).error(function (err) {
                    $scope.error = err.message;
                });
            } else {
                $http.get('/tenants', {
                    params: {
                        pageSize: $scope.itemsPerPage,
                        pageNumber: $scope.currentPage - 1
                    }
                }).success(function (data) {
                    $scope.users = data.users;
                    $scope.userCount = data.total;
                });
            }
        };

        $scope.createUser = function () {
            if ($scope.selectedUserType === 'editor') {
                $http({
                    method: 'POST',
                    url: 'users/editor',
                    data: $scope.credentials
                }).success(function () {
                    window.alert('操作员创建成功！');
                    $scope.credentials = {};
                }).error(function (data) {
                    $scope.error = data.message;
                });
            } else if ($scope.selectedUserType === 'tenant') {
                $http({
                    method: 'POST',
                    url: 'users/tenant',
                    data: $scope.credentials
                }).success(function (result) {
                    if(result.statusCode === 0){
                        window.alert('商家创建成功！');
                        $scope.credentials = {};
                    }else{
                        window.alert('创建商家失败。');
                    }

                }).error(function (data) {
                    $scope.error = data.message;
                });
            }

        };
        $scope.findTenantByKeywords = function () {
            $scope.serchTenantFlag = 'true';
            $http.get('tenants/search?&keyword=' + $scope.keyword, {
                params: {
                    pageSize: $scope.itemsPerPage,
                    pageNumber: 0
                }
            }).success(function (data) {
                $scope.users = data.users;
                $scope.userCount = data.total;
            }).error(function (err) {
                $scope.error = err.message;
            });
        };
        $scope.deleteTenant = function () {
            $http.delete('/tenants/' + $scope.selectedUser.id).success(function (data) {
                if (data.statusCode === 90000) {
                    window.alert('发生了错误，等会再试试看吧。');
                } else if (data.statusCode === 10400) {
                    window.alert('该用户包含任务。请先删除任务:\" ' + data.task.name + ' \"，再删除商户！');
                } else {
                    window.alert('删除成功');
                    $location.path('/tenants');
                }
            }).error(function (err) {
                $scope.error = err.message;
            });
        };
    }
]);
