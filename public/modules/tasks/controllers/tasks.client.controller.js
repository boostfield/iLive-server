'use strict';

// Tasks controller
angular.module('tasks').controller('TasksController', ['$scope', '$stateParams', '$location', '$http', 'Authentication', 'Tasks', 'TasksQuota', 'ScenicSpots', 'Users', 'Countries', 'Provinces', 'Cities',
    function ($scope, $stateParams, $location, $http, Authentication, Tasks, TaskQuota, ScenicSpots, Users, Countries) {
        $scope.authentication = Authentication;
        $scope.bonusQuotas = [50, 100, 200];
        $scope.cityChangeFlag = '';
        $scope.currentPage = 1;
        $scope.itemsPerPage = 10;
        $scope.keyword = null;
        $scope.tenantKeyword = '';
        $scope.scenicSpotKeyword = '';
        $scope.tenants = null;
        $scope.scenicSpots = null;
        $scope.choosedScenicSpotName=null;
        $scope.choosedTenantName=null;
        $scope.allActivityTaskStatus = [
            {value: false, info:'否'},
            {value: true, info:'是'}];

        // Create new Task

        $scope.beforeCreate = function () {
            $scope.newTask = new Tasks();
            $scope.newTask.isActivity = $scope.allActivityTaskStatus[0].value;
            $scope.newTask.selectedByEditor = $scope.allActivityTaskStatus[0].value;
        };
        $scope.create = function () {
            // Create new Task object
            if(!$scope.newTask.name || !$scope.newTask.city || !$scope.newTask.bonus || !$scope.newTask.belongToScenicSpot || !$scope.newTask.belongToUser) {
                window.alert('缺少一些必要信息，再检查一下吧');
            }else {
                $scope.newTask.$save(function (response) {
                    if(response.statusCode === 0){
                        $location.path('tasks/' + response.taskId + '/edit');
                        // Clear form fields
                        $scope.name = '';
                    }else{
                        window.alert('创建失败：'+response.message);
                    }

                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }
        };

        // Remove existing Task
        $scope.remove = function () {
            $http.delete('tasks/' + $scope.task.id).success(function () {
                $location.path('/tasks');
            });
        };
        $scope.getCountries = function () {
            Countries.get().$promise.then(function (result) {
                $scope.countries = result.countries;
            });
        };

        $scope.getProvinces = function () {
            if (this.newTask) {
                $http.get('countries/' + this.newTask.country + '/provinces').success(function (data) {
                    $scope.provinces = data.provinces;
                });
            } else {
                $http.get('countries/' + this.task.country + '/provinces').success(function (data) {
                    $scope.provinces = data.provinces;
                });
            }

        };
        $scope.getCities = function () {
            if ($scope.newTask) {
                $http.get('provinces/' + this.newTask.province + '/cities').success(function (data) {
                    $scope.cities = data.cities;
                });
            } else {
                $http.get('provinces/' + this.task.province + '/cities').success(function (data) {
                    $scope.cities = data.cities;
                });
            }
        };
        $scope.getAreas = function () {
            if ($scope.newTask) {
                $http.get('/cities/'+this.newTask.city+'/areas').success(function (data) {
                    $scope.areas = data.areas;
                });
            } else {
                $http.get('/cities/'+this.task.city.id+'/areas').success(function (data) {
                    $scope.areas = data.areas;
                });
            }
        };
        $scope.saveProvinceAndCityAndArea = function (newCity, newProvince, newArea) {
            if (newCity === $scope.task.city) {
                $scope.cityChangeFlag = '别忘记点击\"更新\"哦！';
            }
            if ($scope.task) {
                $scope.task.city = newCity;
                $scope.task.province = newProvince;
                $scope.task.area = newArea;
            }
            if ($scope.newTask) {
                $scope.newTask.city = newCity;
                $scope.newTask.province = newProvince;
                $scope.newTask.area = newArea;
            }
        };
        $scope.changeSelectedByEditor = function(){
            $http.get('/tasks/select-task-count').success(function (data) {
                if(!$scope.task.selectedByEditor) {
                    if (data.statusCode === 0) {
                        window.alert('记得点击保存。');
                        $scope.task.selectedByEditor = !$scope.task.selectedByEditor;
                        $scope.task.selectedByEditorUseChinese = $scope.task.selectedByEditor?'是':'否';
                        $scope.setSelectedTaskButtonValue =  $scope.task.selectedByEditor?'取消精选':'设为精选';
                    } else {
                        window.alert('精选任务的数量为： ' + data.selectedTasksCount + ' 已经满了!');
                    }
                }else{
                    window.alert('记得点击保存。');
                    $scope.task.selectedByEditor = !$scope.task.selectedByEditor;
                    $scope.task.selectedByEditorUseChinese = $scope.task.selectedByEditor?'是':'否';
                    $scope.setSelectedTaskButtonValue =  $scope.task.selectedByEditor?'取消精选':'设为精选';
                }
            });

        };

        // Update existing Task
        $scope.update = function () {
            if (!$scope.task.city) {
                window.alert('请更新城市信息 😊');
            }
            else if(!$scope.task.name){
                window.alert('缺少名称信息！~');
            }
            else {
                var task = $scope.task;
                if($scope.task.briefInfo) {
                    if(!$scope.task.briefInfo.tenantName && !$scope.task.briefInfo.bonus){
                        task.briefInfo = null;
                    }else {
                        if ($scope.task.briefInfo.tenantName === undefined) {
                            delete task.briefInfo.tenantName;
                        }
                        if ($scope.task.briefInfo.bonus === undefined) {
                            delete task.briefInfo.bonus;
                        }
                    }
                }
                //delete task.quota;
                delete task.restQuota;
                delete task.belongToScenicSpot;
                delete task.belongToUser;
                if (task.city&&task.city.id) {
                    task.city = task.city.id;
                }
                if (task.area&&task.area.id) {
                    task.area = task.area.id;
                }
                if (task.pictures) {
                    if (task.pictures.length > 0) {
                        if (task.pictures[0].id) {
                            for (var index in task.pictures) {
                                task.pictures[index] = task.pictures[index].id;
                            }
                        }
                    }
                }
                Tasks.update(task).$promise.then(function (result) {
                    if (result.statusCode === 0) {
                        window.alert('更新成功! 😊');
                        location.reload();
                    } else {
                        window.alert(result.message);
                    }
                });
            }
        };
        $scope.addQuota = function () {
            TaskQuota.update({id: $scope.task.id, quantity: 50}).$promise.then(function (result) {
                if (result.statusCode === 0) {
                    window.alert('更新成功! 😊');
                    location.reload();

                } else {
                    $scope.error = result.message;
                }
            });
        };
        $scope.minusQuota = function () {
            if ($scope.task.restQuota < 50)
                var minusQuantity = $scope.task.restQuota < 50 ? $scope.task.restQuota : 50;
            TaskQuota.update({id: $scope.task.id, quantity: -50}).$promise.then(function (result) {
                if (result.statusCode === 0) {
                    window.alert('更新成功! 😊');
                    location.reload();
                } else {
                    $scope.error = result.message;
                }
            });
        };
        $scope.removeTaskPicture = function (picId) {
            $http.delete('pictures/' + picId + '/delete-task-picture').success(function (data) {
                for (var index = 0; index < $scope.task.pictures.length; index++) {
                    if ($scope.task.pictures[index].id === picId) {
                        $scope.task.pictures.splice(index, 1);
                        break;
                    }
                }
            });
        };
        $scope.setCoverUrl = function (coverUrl, task) {
            task.coverUrl = coverUrl;
        };
        $scope.selectImg = function (imgPath) {
            $scope.selectedImg = 'http://7xijtn.com1.z0.glb.clouddn.com/' + imgPath;
            var image = new Image();
            image.src = $scope.selectedImg;
            $scope.selectedImgWidth = image.width;
            $scope.selectedImageHeight = image.height;

        };
        // Find a list of Tasks
        $scope.find = function (keyword) {
            var options = {
                pageSize:$scope.itemsPerPage
            };
            if(keyword) {
                options.keyword = keyword;
            }
            Tasks.get(options).$promise.then(function (result) {
                $scope.tasks = result.tasks;
                $scope.totalItems = result.total;
            });
        };
        $scope.findByKeyword = function (keyword) {
            $http.get('/tasks/search?keyword=' + keyword, {
                params: {
                    pageSize: $scope.itemsPerPage
                }
            }).success(function (result) {
                $scope.tasks = result.tasks;
                $scope.totalItems = result.total;
            }).error(function (err) {
                $scope.error = err.message;
            });
        };
        $scope.getTenants = function () {
            Users.get({role: 'tenant'}).$promise.then(function (result) {
                $scope.tenants = result.users;
            });
        };
        $scope.getAuthedScenicSpots = function () {
            ScenicSpots.get({isAuthenticatedTenant: true,pageSize: 500}).$promise.then(function (result) {
                $scope.scenicSpots = result.scenicSpots;
            });
        };
        $scope.findScenicSpotsByKeyword = function () {
            ScenicSpots.get({keyword: $scope.keyword}).$promise.then(function (result) {
                $scope.alternativeParentScenicSpot = result.scenicSpots;
            });
        };
        $scope.setParentScenicSpot = function (scenicSpot) {
            $scope.selectedParentScenicSpot = scenicSpot;
            $scope.newTask.parentScenicSpot = scenicSpot.id;
            delete $scope.alternativeParentScenicSpot;
        };

        $scope.pageChanged = function () {
            Tasks.get({
                pageNumber: $scope.currentPage - 1,
                pageSize: $scope.itemsPerPage
            }).$promise.then(function (result) {
                    $scope.tasks = result.tasks;
                });
        };
        $scope.addTenantByKeywords = function () {
            $http.get('tenants/search?&keyword=' + $scope.tenantKeyword, {
                params: {
                    pageSize: 100
                }
            }).success(function (data) {
                $scope.tenants = data.users;
            }).error(function (err) {
                $scope.error = err.message;
            });
        };
        $scope.saveTenant = function (tenant) {
            $scope.newTask.belongToUser = tenant.id;
            $scope.choosedTenantName = tenant.displayName;
        };
        $scope.addScenicSpotByKeywords = function () {
            $http.get('scenic-spots/search?keyword=' + $scope.tenantKeyword, {
                params: {
                    pageSize: 100
                }
            }).success(function (data) {
                $scope.scenicSpots = data.scenicSpots;
            }).error(function (err) {
                $scope.error = err.message;
            });
        };
        $scope.saveScenicSpot = function (scenicSpot) {
            $scope.newTask.belongToScenicSpot= scenicSpot.id?scenicSpot.id:scenicSpot._id;
            $scope.choosedScenicSpotName = scenicSpot.name;
        };

        // Find existing Task
        $scope.findOne = function () {
            Tasks.get({taskId: $stateParams.taskId}).$promise.then(function (result) {
                $scope.task = result.task;
                $scope.task.selectedByEditorUseChinese = $scope.task.selectedByEditor?'是':'否';
                $scope.task.isActivityUseChinese = $scope.task.isActivity?'是':'否';
                $scope.setSelectedTaskButtonValue =  $scope.task.selectedByEditor?'取消精选':'设为精选';
            });
        };

        $scope.initUpdateUploadController = function () {
            var uploader = Qiniu.uploader({
                runtimes: 'html5,flash,html4',
                browse_button: 'pickfiles',
                container: 'container',
                drop_element: 'container',
                flash_swf_url: 'lib/plupload/js/Moxie.swf',
                //dragdrop: true,
                chunk_size: '4mb',
                uptoken_url: '/qiniu/task-upload-token',
                domain: 'http://7xijtn.com1.z0.glb.clouddn.com/',
                // downtoken_url: '/downtoken',
                // unique_names: true,
                save_key: true,
                max_file_size: '10mb',
                filters: [{title: 'Image files', extensions: 'jpg,jpeg,gif,png'}],
                x_vars: {
                    'taskId': $stateParams.taskId
                },
                auto_start: true,
                init: {
                    'FilesAdded': function (up, files) {
                        $('table').show();
                        $('#success').hide();
                        plupload.each(files, function (file) {
                            var progress = new FileProgress(file, 'fsUploadProgress');
                            progress.setStatus('等待...');
                        });
                    },
                    'BeforeUpload': function (up, file) {
                        var progress = new FileProgress(file, 'fsUploadProgress');
                        var chunk_size = plupload.parseSize(this.getOption('chunk_size'));
                        if (up.runtime === 'html5' && chunk_size) {
                            progress.setChunkProgess(chunk_size);
                        }
                    },
                    'UploadProgress': function (up, file) {
                        var progress = new FileProgress(file, 'fsUploadProgress');
                        var chunk_size = plupload.parseSize(this.getOption('chunk_size'));
                        progress.setProgress(file.percent + '%', up.total.bytesPerSec, chunk_size);
                    },
                    'UploadComplete': function () {
                        $('#success').show();
                    },
                    'FileUploaded': function (up, file, info) {
                        var infoObj = JSON.parse(info);
                        if (infoObj.savedPicture) {
                            var picPattern = {
                                id: infoObj.savedPicture.id,
                                coverUrl: infoObj.savedPicture.coverUrl
                            };
                            $scope.task.pictures.push(picPattern);
                        } else if (infoObj.statusCode === 12001) {
                            window.alert(infoObj.message);
                        }
                        $scope.$apply();
                        var progress = new FileProgress(file, 'fsUploadProgress');
                        progress.setComplete(up, info);
                    },
                    'Error': function (up, err, errTip) {
                        $('table').show();
                        var progress = new FileProgress(err.file, 'fsUploadProgress');
                        progress.setError();
                        progress.setStatus(errTip);
                    }
                }
            });
            uploader.bind('FileUploaded', function () {
            });
        };
    }
]);
