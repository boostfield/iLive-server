'use strict';

// Task lists controller
angular.module('task-lists').controller('TaskListsController', ['$scope', '$stateParams', '$location', '$http', 'Authentication', 'TaskLists', 'Tasks', 'Countries', 'Provinces', 'Cities',
    function ($scope, $stateParams, $location, $http, Authentication, TaskLists, Tasks, Countries) {
        $scope.authentication = Authentication;
        $scope.query = {};
        $scope.newTask = {tasks: []};
        $scope.currentPage = 1;
        $scope.itemsPerPage = 10;
        $scope.taskCount = 0;
        $scope.isOnMainPageType = [{type: '是', bool: true}, {type: '否', bool: false}];
        $scope.cityChangeFlag = '';

        $scope.beforeCreate = function () {
            $scope.newTaskList = {};
        };
        // Create new Task list
        $scope.create = function () {
            // Create new Task list object
            if (!$scope.newTaskList.name) {
                window.alert('缺少名称！~~');
            }
            else if (!$scope.newTaskList.province || !$scope.newTaskList.city || !$scope.newTaskList.area) {
                window.alert('无城市信息（哎呀..不是我批评你，你说你咋能忘了输入城市信息呢？天天想什么呢，不认真工作！！）');
            }
            else {
                var taskList = $scope.newTaskList;
                var taskIdList = [];
                for (var taskIndex in taskList.tasks) {
                    taskIdList.push(taskList.tasks[taskIndex].id);
                }
                taskList.tasks = taskIdList;
                TaskLists.save(taskList).$promise.then(function (result) {
                    if (result.statusCode === 0) {
                        window.alert('创建成功！');
                        $location.path('task-lists/' + result.taskListId + '/edit');
                    } else {
                        $scope.error = result.message;
                    }
                });
            }
        };
        $scope.getCountries = function () {
            Countries.get().$promise.then(function (result) {
                $scope.countries = result.countries;
            });
        };

        $scope.getProvinces = function () {
            if (this.newTaskList) {
                $http.get('countries/' + this.newTaskList.country + '/provinces').success(function (data) {
                    $scope.provinces = data.provinces;
                });
            } else {
                $http.get('countries/' + this.taskList.country + '/provinces').success(function (data) {
                    $scope.provinces = data.provinces;
                });
            }

        };
        $scope.getCities = function () {
            if ($scope.newTaskList) {
                $http.get('provinces/' + this.newTaskList.province + '/cities').success(function (data) {
                    $scope.cities = data.cities;
                });
            } else {
                $http.get('provinces/' + this.taskList.province + '/cities').success(function (data) {
                    $scope.cities = data.cities;
                });
            }
        };
        $scope.getAreas = function () {
            if ($scope.newTaskList) {
                $http.get('/cities/'+this.newTaskList.city+'/areas').success(function (data) {
                    console.dir(data);
                    $scope.areas = data.areas;
                });
            } else {
                $http.get('/cities/'+this.taskList.city.id+'/areas').success(function (data) {
                    $scope.areas = data.areas;
                });
            }
        };
        $scope.getTasksInCity = function () {
            Tasks.get({
                pageSize: $scope.itemsPerPage,
                city: $scope.newTaskList.city
            }).$promise.then(function (result) {
                    $scope.tasks = result.tasks;
                    $scope.taskCount = result.total;
                }
            );
        };
        $scope.saveProvinceAndCityAndArea = function (newCity, newProvince, newArea) {
            if (newCity === $scope.taskList.city) {
                $scope.cityChangeFlag = '别忘记点击\"更新\"哦~~！';
            }
            if ($scope.taskList) {
                $scope.taskList.city = newCity;
                $scope.taskList.province = newProvince;
                $scope.taskList.area = newArea;
                $http.get('/tasks?city=' + $scope.taskList.city.id).success(function (data) {
                    $scope.tasks = data.tasks;
                });
            }
            if ($scope.newTaskList) {
                $scope.newTaskList.city = newCity;
                $scope.newTaskList.province = newProvince;
                $scope.newTaskList.area = newArea;
            }
        };

        // Remove existing Task list
        $scope.remove = function (taskList) {
            if (taskList) {
                taskList.$remove();

                for (var i in $scope.taskLists) {
                    if ($scope.taskLists [i] === taskList) {
                        $scope.taskLists.splice(i, 1);
                    }
                }
            } else {
                $scope.taskList.$remove(function () {
                    $location.path('task-lists');
                });
            }
        };

        // Update existing Task list
        $scope.update = function () {
            if (!$scope.taskList.name) {
                window.alert('缺少名称~~');
            }
            else if (!$scope.taskList.city) {
                window.alert('请更新城市信息 😊');
            }
            else {
                var taskList = $scope.taskList;
                if (taskList.city && taskList.city.id) {
                    taskList.city = taskList.city.id;
                }
                if (taskList.area && taskList.area.id) {
                    taskList.area = taskList.area.id;
                }
                if (!taskList.rule) {
                    taskList.rule = '';
                }
                var taskIdList = [];
                for (var taskIndex in taskList.tasks) {
                    taskIdList.push(taskList.tasks[taskIndex].id);
                }
                taskList.tasks = taskIdList;
                TaskLists.update(taskList).$promise.then(function (result) {
                    if (result.statusCode === 0) {
                        window.alert('更新成功！');
                        location.reload();
                    } else {
                        $scope.error = result.message;
                    }
                });
            }
        };

        // Find a list of Task lists
        $scope.find = function () {
            TaskLists.get({pageSize: $scope.itemsPerPage}).$promise.then(function (result) {
                $scope.taskLists = result.taskLists;
                $scope.totalItems = result.total;
            });
        };

        // Find existing Task list
        $scope.findOne = function () {
            TaskLists.get({
                taskListId: $stateParams.taskListId
            }).$promise.then(function (result) {
                    $scope.taskList = result.taskList;
                    if ($scope.taskList && $scope.taskList.city) {
                        $http.get('/tasks?city=' + $scope.taskList.city.id).success(function (data) {
                            $scope.tasks = data.tasks;
                            $scope.taskCount = data.total;
                        });
                    }
                });
        };

        $scope.addTask = function (taskList, task) {
            if (!taskList.tasks) {
                taskList.tasks = [];
            }
            if (JSON.stringify(taskList.tasks).indexOf(task.id) === -1) {
                taskList.tasks.push(task);
            } else {
                window.alert(task.name + '已经被加入了任务列表中，请勿重复添加！');
            }
        };

        $scope.removeTask = function (taskList, task) {
            var taskIndex = taskList.tasks.indexOf(task);
            if (taskIndex !== -1) {
                taskList.tasks.splice(taskIndex, 1);
            }
        };
        $scope.remove = function () {
            $http.delete('task-lists/' + $scope.taskList.id).success(function () {
                $location.path('/task-lists');
            });
        };

        $scope.pageChanged = function () {
            TaskLists.get({
                pageNumber: $scope.currentPage - 1,
                pageSize: $scope.itemsPerPage
            }).$promise.then(function (result) {
                    $scope.taskLists = result.taskLists;
                });
        };

        $scope.taskPageChanged = function () {
            var query;
            if($scope.newTaskList&&$scope.newTaskList.city){
                query = $scope.newTaskList.city;
            }else{
                query = $scope.taskList.city.id;
            }
            Tasks.get({
                pageNumber: $scope.currentPage - 1,
                pageSize: $scope.itemsPerPage,
                city: query
            }).$promise.then(function (result) {
                    $scope.tasks = result.tasks;
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
                uptoken_url: '/qiniu/task-list-cover-upload-token',
                domain: 'http://7xijtn.com1.z0.glb.clouddn.com/',
                // downtoken_url: '/downtoken',
                // unique_names: true,
                save_key: true,

                max_file_size: '10mb',
                filters: [{title: 'Image files', extensions: 'jpg,jpeg,gif,png'}],
                x_vars: {
                    'taskListId': $stateParams.taskListId
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
                        $scope.taskList.coverUrl = infoObj.path;

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
