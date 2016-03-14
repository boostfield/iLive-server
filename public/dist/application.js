'use strict';
// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
    // Init module configuration options
    var applicationModuleName = 'jackfruit-server';
    var applicationModuleVendorDependencies = ['ngResource', 'ngCookies', 'ngAnimate', 'ngTouch', 'ngSanitize', 'ui.router', 'ui.bootstrap', 'ui.utils'];

    // Add a new vertical module
    var registerModule = function (moduleName, dependencies) {
        // Create angular module
        angular.module(moduleName, dependencies || []);

        // Add the module to the AngularJS configuration file
        angular.module(applicationModuleName).requires.push(moduleName);
    };

    return {
        applicationModuleName: applicationModuleName,
        applicationModuleVendorDependencies: applicationModuleVendorDependencies,
        registerModule: registerModule
    };
})();

'use strict';
//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
    function ($locationProvider) {
        $locationProvider.hashPrefix('!');
    }
]);

//Then define the init function for starting up the application
angular.element(document).ready(function () {
    //Fixing facebook bug with redirect
    if (window.location.hash === '#_=_') window.location.hash = '#!';

    //Then init the app
    angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use application configuration module to register a new module
ApplicationConfiguration.registerModule('activity');

'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('areas');

'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('banners');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('cities');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('countries');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('objection-reports');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('provinces');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('quota-recorders');

'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('scenic-areas');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('scenic-spots');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('task-lists');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('tasks');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('user-feedbacks');
'use strict';

// Use application configuration module to register a new module
ApplicationConfiguration.registerModule('user-management');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';
angular.module('activity').run(['Menus',
    function(Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', '我的活动', 'activities', 'dropdown', '/banners(/create)?', false, ['tenant'], 13);
        Menus.addSubMenuItem('topbar', 'activities', '我的活动列表', 'my-activity-list');
    }
]);

'use strict';

//Setting up route
angular.module('activity').config(['$stateProvider',
    function($stateProvider) {
        // Banners state routing
        $stateProvider
            .state('listActivity',{
                url:'/my-activity-list',
                templateUrl:'modules/activity/views/my-activity-list.client.view.html'
            })
            .state('activity', {
                url: '/my-activity/:activityId',
                templateUrl: 'modules/activity/views/my-activity.client.view.html'
            });
    }
]);

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

'use strict';

// Configuring the Articles module
angular.module('areas').run(['Menus',
    function (Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', '区域', 'areas', 'dropdown', '/areas(/create)?',false, ['unavaliable'], 7);
        Menus.addSubMenuItem('topbar', 'areas', '添加区域', 'areas/create');
    }
]);

'use strict';

//Setting up route
angular.module('areas').config(['$stateProvider',
    function ($stateProvider) {
        // Cities state routing
        $stateProvider.
            state('createAreas', {
                url: '/areas/create',
                templateUrl: 'modules/areas/views/create-areas.client.view.html'
            });
    }
]);

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

'use strict';

// Configuring the Articles module
angular.module('banners').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Banners', 'banners', 'dropdown', '/banners(/create)?', false, ['admin'], 1);
		Menus.addSubMenuItem('topbar', 'banners', 'Banners列表', 'banners');
		Menus.addSubMenuItem('topbar', 'banners', '创建Banner', 'banners/create');
	}
]);

'use strict';

//Setting up route
angular.module('banners').config(['$stateProvider',
	function($stateProvider) {
		// Banners state routing
		$stateProvider.
		state('listBanners', {
			url: '/banners',
			templateUrl: 'modules/banners/views/list-banners.client.view.html'
		}).
		state('createBanner', {
			url: '/banners/create',
			templateUrl: 'modules/banners/views/create-banner.client.view.html'
		}).
		state('viewBanner', {
			url: '/banners/:bannerId',
			templateUrl: 'modules/banners/views/view-banner.client.view.html'
		}).
		state('editBanner', {
			url: '/banners/:bannerId/edit',
			templateUrl: 'modules/banners/views/edit-banner.client.view.html'
		});
	}
]);
'use strict';

// Banners controller
angular.module('banners').controller('BannersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Banners', '$http',
    function ($scope, $stateParams, $location, Authentication, Banners, $http) {
        $scope.authentication = Authentication;

        // Create new Banner
        $scope.create = function () {
            // Create new Banner object
            var banner = new Banners({
                title: this.title,
                subTitle: this.subTitle,
                url: this.bannerUrl,
                coverUrl: this.coverUrl
            });

            // Redirect after save
            banner.$save(function (response) {
                $location.path('banners/' + response._id);

                // Clear form fields
                $scope.name = '';
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing Banner
        $scope.remove = function () {
            if ($scope.bannerToDelete) {
                $http.delete('banners/' + $scope.bannerToDelete._id).then(function (data) {
                    for (var i in $scope.banners) {
                        if ($scope.banners [i] === $scope.bannerToDelete) {
                            $scope.banners.splice(i, 1);
                            window.alert('banner' + $scope.bannerToDelete.title + '删除成功！');
                            $scope.bannerToDelete = undefined;
                        }
                    }
                });
            }
        };

        $scope.setBannerToDelete = function (banner) {
            $scope.bannerToDelete = banner;
        };

        // Update existing Banner
        $scope.update = function () {
            var banner = $scope.banner;
            banner.$update(function () {
                $location.path('banners/' + banner._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Banners
        $scope.find = function () {
            $http.get('banners').success(function (data) {
                $scope.banners = data.banners;
            }).error(function (err) {
                $scope.error = err.message;
            });
        };

        // Find existing Banner
        $scope.findOne = function () {
            Banners.get({
                bannerId: $stateParams.bannerId
            }).$promise.then(function (result) {
                    $scope.banner = result.banner;
                }
            );
        };

        $scope.initCreateUploadController = function (update) {

            var uploader = Qiniu.uploader({
                runtimes: 'html5,flash,html4',
                browse_button: 'pickfiles',
                container: 'container',
                drop_element: 'container',
                flash_swf_url: 'lib/plupload/js/Moxie.swf',
                chunk_size: '4mb',
                uptoken_url: '/qiniu/banner-image-upload-token',
                domain: 'http://7xijtn.com1.z0.glb.clouddn.com/',
                save_key: true,
                max_file_size: '1024kb',
                filters: [{title: 'Image files', extensions: 'jpg,jpeg,gif,png'}],
                x_vars: {
                    bannerId: $stateParams.bannerId
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
                        if (update) {
                            $scope.banner.coverUrl = infoObj.key;
                        } else {
                            $scope.coverUrl = infoObj.key;
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

'use strict';

//Banners service used to communicate Banners REST endpoints
angular.module('banners').factory('Banners', ['$resource',
	function($resource) {
		return $resource('banners/:bannerId', { bannerId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Configuring the Articles module
angular.module('cities').run(['Menus',
    function (Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', '城市', 'cities', 'dropdown', '/cities(/create)?',false, ['editor','admin'], 6);
        Menus.addSubMenuItem('topbar', 'cities', '查看所有城市', 'cities');
        Menus.addSubMenuItem('topbar', 'cities', '查看热门城市', 'cities/hot');
        Menus.addSubMenuItem('topbar', 'cities', '添加城市', 'cities/create');
    }
]);

'use strict';

//Setting up route
angular.module('cities').config(['$stateProvider',
    function ($stateProvider) {
        // Cities state routing
        $stateProvider.
            state('listCities', {
                url: '/cities',
                templateUrl: 'modules/cities/views/list-cities.client.view.html'
            }).
            state('createCity', {
                url: '/cities/create',
                templateUrl: 'modules/cities/views/create-city.client.view.html'
            }).
            state('viewHotCity', {
                url: '/cities/hot',
                templateUrl: 'modules/cities/views/hot-cities.client.view.html'
            }).
            state('viewCity', {
                url: '/cities/:cityId',
                templateUrl: 'modules/cities/views/view-city.client.view.html'
            });
    }
]);

'use strict';

// Cities controller
angular.module('cities').controller('CitiesController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Cities', 'Countries',
    function ($scope, $http, $stateParams, $location, Authentication, Cities, Countries) {
        $scope.authentication = Authentication;
        $scope.itemsPerPage = 10;
        $scope.currentPage = 1;
        $scope.cityCount = 0;
        $scope.keyword = '';
        $scope.newCity = {};
        $scope.newArea = {};
        $scope.areas = {};
        $scope.selectArea = {};
        // Create new City
        $scope.create = function () {
            // Create new City object
            var city = new Cities($scope.newCity);

            // Redirect after save
            city.$save(function (response) {
                $location.path('cities/' + response.city.id);
                // Clear form fields
                $scope.name = '';
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing City
        $scope.remove = function (city) {
            if (city) {
                city.$remove();

                for (var i in $scope.cities) {
                    if ($scope.cities [i] === city) {
                        $scope.cities.splice(i, 1);
                    }
                }
            } else {
                $scope.city.$remove(function () {
                    $location.path('cities');
                });
            }
        };

        // Update existing City
        $scope.update = function () {
            var city = $scope.city;
            for (var tipIndex in city.tips) {
                city.tips[tipIndex] = city.tips[tipIndex].text;
            }
            for (var thingsIndex in city.thingsMustDo) {
                city.thingsMustDo[thingsIndex] = city.thingsMustDo[thingsIndex].text;
            }
            $http.put('cities/' + city.id, city).success(function (data) {
                if (data.statusCode === 0) {
                    window.alert('城市信息更新成功! 😊');
                    location.reload();
                }
            }).error(function (data) {
                $scope.error = data.message;
            });
        };
        $scope.removePicture = function (path) {
            var pathIndex = $scope.city.album.indexOf(path);
            if (pathIndex !== -1) {
                $scope.city.album.splice(pathIndex, 1);
                $http.put('cities/' + $scope.city.id, $scope.city).success(function (data) {
                });
            }
        };
        $scope.addNewArea = function () {
            var isAreaNameUnique = true;
            for (var index in $scope.areas) {
                if ($scope.areas[index].name === $scope.newArea.name) {
                    isAreaNameUnique = false;
                }
            }
            if (!isAreaNameUnique) {
                window.alert('城市下区域的名字不能相同');
            } else {
                $scope.newArea.city = $scope.city.id;
                $http.post('/areas', {
                    area: $scope.newArea
                }).success(function (data) {
                    if (data.statusCode === 0) {
                        $scope.areas.push(data.area);

                    } else {
                        window.alert(data.message);
                    }
                });
            }

        };
        $scope.deleteArea = function (area) {
            $http.delete('/areas/' + area.id, {
                area: area
            }).success(function (data) {
                if (data.statusCode === 0) {
                    var index;
                    for (index = 0; index < $scope.areas.length; index++) {
                        if ($scope.areas[index].id === area.id) {
                            $scope.areas.splice(index);
                            index--;
                        }
                    }
                } else {
                    window.alert(data.message);
                }
            });
        };
        $scope.editArea = function (area) {
            var editAreaNameIsUnique = true;
            for (var index in $scope.areas) {
                if ($scope.areas[index].name === area.name && $scope.areas[index].id !== area.id) {
                    editAreaNameIsUnique = false;
                }
            }
            if(editAreaNameIsUnique) {
                $http.put('/areas/' + area.id, {
                    name: area.name
                }).success(function (data) {
                    if (data.statusCode !== 0) {
                        window.alert(data);
                    }
                });
            }else{
                window.alert('修改之后的区域名，要唯一');
                $scope.selectArea = {};
                $http.get('/cities/' + $stateParams.cityId + '/areas').success(function (data) {
                    $scope.areas = data.areas;
                });

            }
        };
        $scope.selectArea = function (area) {
            $scope.selectArea = area;
        };
        $scope.selectImg = function (imgPath) {
            $scope.selectedImg = 'http://7xijtn.com1.z0.glb.clouddn.com/' + imgPath;
            var image = new Image();
            image.src = $scope.selectedImg;
            $scope.selectedImgWidth = image.width;
            $scope.selectedImageHeight = image.height;

        };
        // Find a list of Cities
        $scope.find = function () {
            Cities.get({
                pageSize: $scope.itemsPerPage,
                pageNumber: $scope.currentPage - 1

            }).$promise.then(function (result) {
                    $scope.cities = result.cities;
                    $scope.cityCount = result.total;
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

        $scope.setCoverUrl = function (coverPath) {
            $scope.city.coverUrl = coverPath;
        };

        $scope.getHotCities = function () {
            $http.get('cities/hot').success(function (data) {
                $scope.hotCities = data.cities;
            });
        };
        $scope.findByKeyword = function () {
            $http.get('cities/search', {
                params: {keyword: $scope.keyword}
            }).success(function (data) {
                $scope.cities = data.cities;
                $scope.cityCount = data.total;
            });
        };
        // Find existing City
        $scope.findOne = function () {
            Cities.get({
                cityId: $stateParams.cityId
            }).$promise.then(function (result) {
                    for (var tipIndex in result.city.tips) {
                        result.city.tips[tipIndex] = {text: result.city.tips[tipIndex]};
                    }
                    for (var thingsIndex in result.city.thingsMustDo) {
                        result.city.thingsMustDo[thingsIndex] = {text: result.city.thingsMustDo[thingsIndex]};
                    }
                    $scope.city = result.city;
                });
        };
        $scope.getAreasByCityId = function () {
            $http.get('/cities/' + $stateParams.cityId + '/areas').success(function (data) {
                $scope.areas = data.areas;
            });
        };

        $scope.pageChanged = function () {
            Cities.get({
                pageSize: $scope.itemsPerPage,
                pageNumber: $scope.currentPage - 1

            }).$promise.then(function (result) {
                    $scope.cities = result.cities;
                    $scope.cityCount = result.total;
                });
        };

        $scope.prevPage = function () {
            if ($scope.currentPage > 0) {
                $scope.currentPage--;
            }
        };


        $scope.prevPageDisabled = function () {
            return $scope.currentPage === 0 ? 'disabled' : '';
        };


        $scope.pageCount = function () {
            return Math.ceil($scope.pageCount / $scope.itemsPerPage) - 1;
        };


        $scope.nextPage = function () {
            if ($scope.currentPage < $scope.pageCount) {
                $scope.currentPage++;
            }
        };

        $scope.nextPageDisabled = function () {
            return $scope.currentPage === $scope.pageCount ? 'disabled' : '';
        };

        $scope.addTip = function () {
            $scope.city.tips.push({text: $scope.newTip});
            $scope.newTip = '';
        };
        $scope.deleteTip = function (index) {
            $scope.city.tips.splice(index, 1);
        };

        $scope.addThingsMustDo = function () {

            $scope.city.thingsMustDo.push({text: $scope.newThingsMustDo});
            $scope.newThingsMustDo = '';
        };
        $scope.deleteThingsMustDo = function (index) {
            $scope.city.thingsMustDo.splice(index, 1);
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
                uptoken_url: '/qiniu/city-image-upload-token',
                domain: 'http://7xijtn.com1.z0.glb.clouddn.com/',
                // downtoken_url: '/downtoken',
                // unique_names: true,
                save_key: true,

                max_file_size: '1024kb',
                filters: [{title: 'Image files', extensions: 'jpg,jpeg,gif,png'}],
                x_vars: {
                    'id': $stateParams.cityId
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
                        $scope.city.album.push(infoObj.key);
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

'use strict';

//Cities service used to communicate Cities REST endpoints
angular.module('cities').factory('Cities', ['$resource',
    function ($resource) {
        return $resource('cities/:cityId', {
            cityId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');

        // Home state routing
        $stateProvider.
            state('home', {
                url: '/',
                templateUrl: 'modules/users/views/authentication/signin.client.view.html'
            });
    }
]);

'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus',
    function ($scope, Authentication, Menus) {
        $scope.authentication = Authentication;
        $scope.isCollapsed = false;
        $scope.menu = Menus.getMenu('topbar');

        $scope.toggleCollapsibleMenu = function () {
            $scope.isCollapsed = !$scope.isCollapsed;
        };

        // Collapsing the menu after navigation
        $scope.$on('$stateChangeSuccess', function () {
            $scope.isCollapsed = false;
        });
    }
]);

'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
    function ($scope, Authentication) {
        // This provides Authentication context.
        $scope.authentication = Authentication;
    }
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

    function () {
        // Define a set of default roles
        this.defaultRoles = ['*'];

        // Define the menus object
        this.menus = {};

        // A private function for rendering decision
        var shouldRender = function (user) {
            if (user) {
                if (!!~this.roles.indexOf('*')) {
                    return true;
                } else {
                    for (var userRoleIndex in user.roles) {
                        for (var roleIndex in this.roles) {
                            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
                                return true;
                            }
                        }
                    }
                }
            } else {
                return this.isPublic;
            }

            return false;
        };

        // Validate menu existance
        this.validateMenuExistance = function (menuId) {
            if (menuId && menuId.length) {
                if (this.menus[menuId]) {
                    return true;
                } else {
                    throw new Error('Menu ' + menuId + ' does not exists');
                    //return false;
                }
            } else {
                throw new Error('MenuId was not provided');
            }

            return false;
        };

        // Get the menu object by menu id
        this.getMenu = function (menuId) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Return the menu object
            return this.menus[menuId];
        };

        // Add new menu object by menu id
        this.addMenu = function (menuId, isPublic, roles) {
            // Create the new menu
            this.menus[menuId] = {
                isPublic: isPublic || false,
                roles: roles || this.defaultRoles,
                items: [],
                shouldRender: shouldRender
            };
            // Return the menu object
            return this.menus[menuId];
        };

        // Remove existing menu object by menu id
        this.removeMenu = function (menuId) {
            // Validate that the menu exists

            this.validateMenuExistance(menuId);

            // Return the menu object
            delete this.menus[menuId];
        };

        // Add menu item object
        this.addMenuItem = function (menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Push new menu item
            this.menus[menuId].items.push({
                title: menuItemTitle,
                link: menuItemURL,
                menuItemType: menuItemType || 'item',
                menuItemClass: menuItemType,
                uiRoute: menuItemUIRoute || ('/' + menuItemURL),
                isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
                roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
                position: position || 0,
                items: [],
                shouldRender: shouldRender
            });

            // Return the menu object
            return this.menus[menuId];
        };

        // Add submenu item object
        this.addSubMenuItem = function (menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Search for menu item
            for (var itemIndex in this.menus[menuId].items) {
                if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
                    // Push new submenu item
                    this.menus[menuId].items[itemIndex].items.push({
                        title: menuItemTitle,
                        link: menuItemURL,
                        uiRoute: menuItemUIRoute || ('/' + menuItemURL),
                        isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
                        roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
                        position: position || 0,
                        shouldRender: shouldRender
                    });
                }
            }

            // Return the menu object
            return this.menus[menuId];
        };

        // Remove existing menu object by menu id
        this.removeMenuItem = function (menuId, menuItemURL) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Search for menu item to remove
            for (var itemIndex in this.menus[menuId].items) {
                if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
                    this.menus[menuId].items.splice(itemIndex, 1);
                }
            }

            // Return the menu object
            return this.menus[menuId];
        };

        // Remove existing menu object by menu id
        this.removeSubMenuItem = function (menuId, submenuItemURL) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Search for menu item to remove
            for (var itemIndex in this.menus[menuId].items) {
                for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
                    if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
                        this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
                    }
                }
            }

            // Return the menu object
            return this.menus[menuId];
        };

        //Adding the topbar menu
        this.addMenu('topbar');
    }
]);

'use strict';

// Configuring the Articles module
angular.module('countries').run(['Menus',
    function (Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', '国家', 'countries', 'dropdown', '/countries(/create)?', false, ['unavaliable'], 4);
        Menus.addSubMenuItem('topbar', 'countries', '查看国家列表', 'countries');
        Menus.addSubMenuItem('topbar', 'countries', '添加国家', 'countries/create');
    }
]);

'use strict';

//Setting up route
angular.module('countries').config(['$stateProvider',
    function ($stateProvider) {
        // Countries state routing
        $stateProvider.
            state('listCountries', {
                url: '/countries',
                templateUrl: 'modules/countries/views/list-countries.client.view.html'
            }).
            state('createCountry', {
                url: '/countries/create',
                templateUrl: 'modules/countries/views/create-country.client.view.html'
            }).
            state('viewCountry', {
                url: '/countries/:countryId',
                templateUrl: 'modules/countries/views/view-country.client.view.html'
            }).
            state('editCountry', {
                url: '/countries/:countryId/edit',
                templateUrl: 'modules/countries/views/edit-country.client.view.html'
            });
    }
]);

'use strict';

// Countries controller
angular.module('countries').controller('CountriesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Countries',
    function ($scope, $stateParams, $location, Authentication, Countries) {
        $scope.authentication = Authentication;

        // Create new Country
        $scope.create = function () {
            // Create new Country object
            var country = new Countries({
                name: this.name
            });

            // Redirect after save
            country.$save(function (response) {
                $location.path('countries/' + response._id);

                // Clear form fields
                $scope.name = '';
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing Country
        $scope.remove = function (country) {
            if (country) {
                country.$remove();

                for (var i in $scope.countries) {
                    if ($scope.countries [i] === country) {
                        $scope.countries.splice(i, 1);
                    }
                }
            } else {
                $scope.country.$remove(function () {
                    $location.path('countries');
                });
            }
        };

        // Update existing Country
        $scope.update = function () {
            var country = $scope.country;

            country.$update(function () {
                $location.path('countries/' + country._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Countries
        $scope.find = function () {
            $scope.countries = Countries.query();
        };

        // Find existing Country
        $scope.findOne = function () {
            $scope.country = Countries.get({
                countryId: $stateParams.countryId
            });
        };
    }
]);

'use strict';

//Countries service used to communicate Countries REST endpoints
angular.module('countries').factory('Countries', ['$resource',
    function ($resource) {
        return $resource('countries/:countryId', {
            countryId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);

'use strict';

// Configuring the Articles module
angular.module('objection-reports').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', '用户举报', 'objection-reports', 'dropdown', '/objection-reports(/create)?', false, ['unavaliable'], 11);
		Menus.addSubMenuItem('topbar', 'objection-reports', '举报列表', 'objection-reports');
	}
]);

'use strict';

//Setting up route
angular.module('objection-reports').config(['$stateProvider',
	function($stateProvider) {
		// Objection reports state routing
		$stateProvider.
		state('listObjectionReports', {
			url: '/objection-reports',
			templateUrl: 'modules/objection-reports/views/list-objection-reports.client.view.html'
		}).
		state('createObjectionReport', {
			url: '/objection-reports/create',
			templateUrl: 'modules/objection-reports/views/create-objection-report.client.view.html'
		}).
		state('viewObjectionReport', {
			url: '/objection-reports/:objectionReportId',
			templateUrl: 'modules/objection-reports/views/view-objection-report.client.view.html'
		}).
		state('editObjectionReport', {
			url: '/objection-reports/:objectionReportId/edit',
			templateUrl: 'modules/objection-reports/views/edit-objection-report.client.view.html'
		});
	}
]);
'use strict';

// Objection reports controller
angular.module('objection-reports').controller('ObjectionReportsController', ['$scope', '$stateParams', '$location', '$http', 'Authentication', 'ObjectionReports',
	function($scope, $stateParams, $location, $http, Authentication, ObjectionReports) {
		$scope.authentication = Authentication;
        $scope.itemsPerPage = 10;
		// Create new Objection report
		$scope.create = function() {
			// Create new Objection report object
			var objectionReport = new ObjectionReports ({
				name: this.name
			});

			// Redirect after save
			objectionReport.$save(function(response) {
				$location.path('objection-reports/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Objection report
		$scope.remove = function(objectionReport) {
			if ( objectionReport ) { 
				objectionReport.$remove();

				for (var i in $scope.objectionReports) {
					if ($scope.objectionReports [i] === objectionReport) {
						$scope.objectionReports.splice(i, 1);
					}
				}
			} else {
				$scope.objectionReport.$remove(function() {
					$location.path('objection-reports');
				});
			}
		};

		// Update existing Objection report
		$scope.update = function() {
			var objectionReport = $scope.objectionReport;

			objectionReport.$update(function() {
				$location.path('objection-reports/' + objectionReport._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Objection reports
		$scope.find = function() {
            ObjectionReports.get({pageNumber: 0, pageSize: $scope.itemsPerPage}).$promise.then(function (result) {
                $scope.objectionReports = result.objectionReports;
                $scope.totalItems = result.total;
            });
		};

		// Find existing Objection report
		$scope.findOne = function() {
			$scope.objectionReport = ObjectionReports.get({ 
				objectionReportId: $stateParams.objectionReportId
			});
		};
	}
]);

'use strict';

//Objection reports service used to communicate Objection reports REST endpoints
angular.module('objection-reports').factory('ObjectionReports', ['$resource',
	function($resource) {
		return $resource('objection-reports/:objectionReportId', { objectionReportId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Configuring the Articles module
angular.module('provinces').run(['Menus',
    function (Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', '省份', 'provinces', 'dropdown', '/provinces(/create)?', false, ['unavaliable'], 5);
        Menus.addSubMenuItem('topbar', 'provinces', '查看所有省份', 'provinces');
        Menus.addSubMenuItem('topbar', 'provinces', '添加省份', 'provinces/create');
    }
]);

'use strict';

//Setting up route
angular.module('provinces').config(['$stateProvider',
    function ($stateProvider) {
        // Provinces state routing
        $stateProvider.
            state('listProvinces', {
                url: '/provinces',
                templateUrl: 'modules/provinces/views/list-provinces.client.view.html'
            }).
            state('createProvince', {
                url: '/provinces/create',
                templateUrl: 'modules/provinces/views/create-province.client.view.html'
            }).
            state('viewProvince', {
                url: '/provinces/:provinceId',
                templateUrl: 'modules/provinces/views/view-province.client.view.html'
            }).
            state('editProvince', {
                url: '/provinces/:provinceId/edit',
                templateUrl: 'modules/provinces/views/edit-province.client.view.html'
            });
    }
]);

'use strict';

// Provinces controller
angular.module('provinces').controller('ProvincesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Provinces',
    function ($scope, $stateParams, $location, Authentication, Provinces) {
        $scope.authentication = Authentication;

        // Create new Province
        $scope.create = function () {
            // Create new Province object
            var province = new Provinces({
                name: this.name
            });

            // Redirect after save
            province.$save(function (response) {
                $location.path('provinces/' + response._id);

                // Clear form fields
                $scope.name = '';
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing Province
        $scope.remove = function (province) {
            if (province) {
                province.$remove();

                for (var i in $scope.provinces) {
                    if ($scope.provinces [i] === province) {
                        $scope.provinces.splice(i, 1);
                    }
                }
            } else {
                $scope.province.$remove(function () {
                    $location.path('provinces');
                });
            }
        };

        // Update existing Province
        $scope.update = function () {
            var province = $scope.province;

            province.$update(function () {
                $location.path('provinces/' + province._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Provinces
        $scope.find = function () {
            $scope.provinces = Provinces.query();
        };

        // Find existing Province
        $scope.findOne = function () {
            $scope.province = Provinces.get({
                provinceId: $stateParams.provinceId
            });
        };
    }
]);

'use strict';

//Provinces service used to communicate Provinces REST endpoints
angular.module('provinces').factory('Provinces', ['$resource',
    function ($resource) {
        return $resource('provinces/:provinceId', {
            provinceId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);

'use strict';

// Configuring the Articles module
angular.module('quota-recorders').run(['Menus',
    function (Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', '配额请求', 'quota-recorders', 'dropdown', '/quota-recorders(/check)?', false, ['admin'], 15);
        Menus.addSubMenuItem('topbar', 'quota-recorders', '查看所有请求', 'quota-recorders');
        Menus.addSubMenuItem('topbar', 'quota-recorders', '审核请求', 'unchecked-quota-recorders');
    }
]);

'use strict';

//Setting up route
angular.module('quota-recorders').config(['$stateProvider',
    function ($stateProvider) {
        // Scenic spots state routing
        $stateProvider.
            state('listQuotaRecorder', {
                url: '/quota-recorders',
                templateUrl: 'modules/quota-recorder/views/list-quota-recorder.client.view.html'
            }).
            state('checkQuotaRecorder', {
                url:'/unchecked-quota-recorders',
                templateUrl: 'modules/quota-recorder/views/check-quota-recorder.client.view.html'
            }).
            state('viewQuotaRecorder', {
                url: '/quota-recorders/:quotaRecorderId',
                templateUrl: 'modules/quota-recorder/views/view-quota-recorder.client.view.html'
            });
    }
]);

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

'use strict';

angular.module('quota-recorders').factory('QuotaRecorders', ['$resource',
    function ($resource) {
        return $resource('quota-recorders/:quotaRecorderId', {
            quotaRecorderId: '@id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);


'use strict';

// Configuring the Articles module
angular.module('scenic-areas').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', '景区', 'scenic-areas', 'dropdown', '/scenic-areas(/create)?', false, ['unavaliable'], 7);
		Menus.addSubMenuItem('topbar', 'scenic-areas', '查看景区列表', 'scenic-areas');
		Menus.addSubMenuItem('topbar', 'scenic-areas', '创建景区', 'scenic-areas/create');
	}
]);

'use strict';

//Setting up route
angular.module('scenic-areas').config(['$stateProvider',
	function($stateProvider) {
		// Scenic areas state routing
		$stateProvider.
		state('listScenicAreas', {
			url: '/scenic-areas',
			templateUrl: 'modules/scenic-areas/views/list-scenic-areas.client.view.html'
		}).
		state('createScenicArea', {
			url: '/scenic-areas/create',
			templateUrl: 'modules/scenic-areas/views/create-scenic-area.client.view.html'
		}).
		state('viewScenicArea', {
			url: '/scenic-areas/:scenicAreaId',
			templateUrl: 'modules/scenic-areas/views/view-scenic-area.client.view.html'
		});
	}
]);

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

'use strict';

//Scenic areas service used to communicate Scenic areas REST endpoints
angular.module('scenic-areas').factory('ScenicAreas', ['$resource',
	function($resource) {
		return $resource('scenic-areas/:scenicAreaId', { scenicAreaId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Configuring the Articles module
angular.module('scenic-spots').run(['Menus',
    function (Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', '执行地', 'scenic-spots', 'dropdown', '/scenic-spots(/create)?', false, ['editor', 'admin'], 8);
        Menus.addSubMenuItem('topbar', 'scenic-spots', '创建执行地', 'scenic-spots/create');
        Menus.addSubMenuItem('topbar', 'scenic-spots', '查看所有执行地', 'scenic-spots');

    }
]);

'use strict';

//Setting up route
angular.module('scenic-spots').config(['$stateProvider',
    function ($stateProvider) {
        // Scenic spots state routing
        $stateProvider.
            state('listScenicSpots', {
                url: '/scenic-spots',
                templateUrl: 'modules/scenic-spots/views/list-scenic-spots.client.view.html'
            }).
            state('createScenicSpot', {
                url: '/scenic-spots/create',
                templateUrl: 'modules/scenic-spots/views/create-scenic-spot.client.view.html'
            }).
            state('queryScenicSpot', {
                url: '/scenic-spots/query',
                templateUrl: 'modules/scenic-spots/views/query-scenic-spot.client.view.html'
            }).
            state('checkScenicSpot', {
                url:'/scenic-spots/check',
                templateUrl: 'modules/scenic-spots/views/check-scenic-spot.client.view.html'
            }).
            state('viewScenicSpot', {
                url: '/scenic-spots/:scenicSpotId',
                templateUrl: 'modules/scenic-spots/views/view-scenic-spot.client.view.html'
            });
    }
]);

'use strict';

// Scenic spots controller
angular.module('scenic-spots').controller('ScenicSpotsController', ['$scope', '$stateParams',
    '$location', '$http', 'Authentication', 'ScenicSpots', 'Countries', 'Pictures', 'Provinces', 'Cities',
    function ($scope, $stateParams, $location, $http, Authentication, ScenicSpots, Countries, Pictures) {
        $scope.authentication = Authentication;
        $scope.scenicSpotType = [{type: '执行地', value: 'custom'}, {type: '', value: 'manual'}];
        $scope.currentPage = 1;
        $scope.itemsPerPage = 10;
        $scope.newScenicSpot = new ScenicSpots();
        $scope.newScenicSpot.album = [];
        $scope.newScenicSpot.tips = [];
        $scope.authenticatedTenantType = [{type: '是', bool: true}, {type: '否', bool: false}];
        $scope.isOnMainPageType = [{type: '是', bool: true}, {type: '否', bool: false}];
        $scope.query = {};
        $scope.keyword = '';
        $scope.findScenicSpotsByKeywordFlag = 'false';
        $scope.findScenicSpotsByCityFlag = 'false';
        // Create new Scenic spot
        $scope.create = function () {
            if ((!$scope.newScenicSpot.location) || (!$scope.newScenicSpot.location.lat) || (!$scope.newScenicSpot.location.lng) ||
                $scope.newScenicSpot.location.lat >= 90 ||
                $scope.newScenicSpot.location.lat <= -90 ||
                $scope.newScenicSpot.location.lng <= 0 ||
                $scope.newScenicSpot.location.lng >= 180) {
                window.alert('请正确输入经纬度的信息。经度（－180~180） 纬度（-90~90）！');
            }else if(!$scope.newScenicSpot.name) {
                window.alert('缺少执行地名称！');
            }else
            {
                //// Redirect after save
                $scope.newScenicSpot.$save(function (response) {
                    window.alert('执行地「' + response.scenicSpot.name + '」创建成功！');
                    $scope.newScenicSpot = new ScenicSpots();
                    $scope.newScenicSpot.album = [];
                    $scope.newScenicSpot.tips = [];
                    $location.path('/scenic-spots');

                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }
        };

        // Remove existing Scenic spot
        $scope.remove = function (scenicSpot) {
            $('#myPleaseWait').modal('show');
            if (scenicSpot) {
                scenicSpot.$remove();

                for (var i in $scope.scenicSpots) {
                    if ($scope.scenicSpots [i] === scenicSpot) {
                        $scope.scenicSpots.splice(i, 1);
                    }
                }
            } else {
                $http.delete('scenic-spots/' + $scope.scenicSpot.id).success(function () {
                    $('#myPleaseWait').modal('hide');
                    window.alert('执行地' + $scope.scenicSpot.name + '删除成功！');
                    $location.path('scenic-spots');
                });
            }
        };
        $scope.getCountries = function () {
            Countries.get().$promise.then(function (result) {
                $scope.countries = result.countries;
            });
        };
        $scope.searchByGetProvinces = function () {
            $http.get('countries/551115cea6ab3f760913b2e5' + '/provinces').success(function (data) {
                $scope.provinces = data.provinces;
            });
        };
        $scope.searchByGetCities = function () {
            $http.get('provinces/' + $scope.query.province + '/cities').success(function (data) {
                $scope.cities = data.cities;
            });
        };

        $scope.findByCities = function () {
            $scope.findScenicSpotsByKeywordFlag = 'false';
            $scope.findScenicSpotsByCityFlag = 'true';
            $http.get('cities/' + $scope.query.city + '/scenic-spots', {
            params: {
                pageSize: $scope.itemsPerPage,
                pageNumber: 0
            }
        }).success(function (data) {
                $scope.scenicSpots = data.scenicSpots;
                $scope.totalItems = data.total;
            });
        };
        $scope.findByKeywords = function () {
            $scope.findScenicSpotsByKeywordFlag = 'true';
            $scope.findScenicSpotsByCityFlag = 'false';
            $http.get('scenic-spots/search?keyword=' + $scope.keyword , {
                params: {
                    pageSize: $scope.itemsPerPage,
                    pageNumber: 0
                }
            }).success(function (data) {
                $scope.scenicSpots = data.scenicSpots;
                $scope.totalItems = data.total;
            }).error(function(data){
                $scope.error = data.message;
            });
        };

        $scope.getProvinces = function () {
            $http.get('countries/' + this.newScenicSpot.country + '/provinces').success(function (data) {
                $scope.provinces = data.provinces;
            });
        };
        $scope.getCities = function () {
            $http.get('provinces/' + this.newScenicSpot.province + '/cities').success(function (data) {
                $scope.cities = data.cities;
            });
        };
        // Update existing Scenic spot
        $scope.update = function () {
            //避免修改tips数据对前台的修改。
            var scenicSpot = JSON.parse(JSON.stringify($scope.scenicSpot));
            //将tips转换为系统需要的类型。
            for (var index in scenicSpot.tips) {
                scenicSpot.tips[index] = scenicSpot.tips[index].text;
            }
            for (index in scenicSpot.pictures) {
                scenicSpot.pictures[index] = scenicSpot.pictures[index].id;
            }
            scenicSpot.geoLocation = [scenicSpot.location.lng, scenicSpot.location.lat];
            $http.put('scenic-spots/' + scenicSpot.id, scenicSpot).success(function (data) {
                if (data.statusCode === 0) {
                    window.alert('更新成功! 😊');
                }
            }).error(function (data) {
                $scope.error = data.message;
            });
        };

        $scope.setCoverUrl = function (coverUrl, scenicSpot) {
            scenicSpot.coverUrl = coverUrl;
        };
        $scope.setOnMainPage = function (pictureId, isOnMainPage) {
            Pictures.update({
                id: pictureId,
                isOnMainPage: isOnMainPage
            }).$promise.then(function (result) {
                    if (result.statusCode === 0) {
                        window.alert('设置成功! ');
                        location.reload();
                    } else {
                        $scope.error = result.message;
                    }
                });
        };

        // Find a list of Scenic spots
        $scope.find = function () {
            ScenicSpots.get({pageNumber: 0, pageSize: $scope.itemsPerPage}).$promise.then(function (result) {
                $scope.scenicSpots = result.scenicSpots;
                $scope.totalItems = result.total;
            });
        };

        // Find existing Scenic spot
        $scope.findOne = function () {
            ScenicSpots.get({
                scenicSpotId: $stateParams.scenicSpotId
            }).$promise.then(function (result) {

                    //解决小贴士无法更新的heck方法。传递Object
                    for (var tipIndex in result.scenicSpot.tips) {
                        result.scenicSpot.tips[tipIndex] = {text: result.scenicSpot.tips[tipIndex]};
                    }
                    $scope.scenicSpot = result.scenicSpot;
                });
        };
        $scope.getEditPage = function (scenicSpot) {
            window.open('/#!/scenic-spots/' + scenicSpot.id, '_blank');

        };

        $scope.pageChanged = function () {
            if($scope.findScenicSpotsByKeywordFlag === 'true' && $scope.findScenicSpotsByCityFlag === 'false') {
                $http.get('scenic-spots/search?keyword=' + $scope.keyword, {
                    params: {
                        pageSize: $scope.itemsPerPage,
                        pageNumber: $scope.currentPage-1
                    }
                }).success(function (data) {
                    $scope.scenicSpots = data.scenicSpots;
                }).error(function (data) {
                    $scope.error = data.message;
                });
            }else if($scope.findScenicSpotsByCityFlag === 'true' && $scope.findScenicSpotsByKeywordFlag === 'false'){
                $http.get('cities/' + $scope.query.city + '/scenic-spots', {
                    params: {
                        pageSize: $scope.itemsPerPage,
                        pageNumber: $scope.currentPage-1
                    }
                }).success(function (data) {
                    $scope.scenicSpots = data.scenicSpots;
                });
            }else {
                ScenicSpots.get({
                    pageNumber: $scope.currentPage - 1,
                    pageSize: $scope.itemsPerPage
                }).$promise.then(function (result) {
                        $scope.scenicSpots = result.scenicSpots;
                    });
            }
        };

        $scope.removePicture = function (picId) {
            $http.delete('pictures/' + picId).success(function (data) {
                for (var index = 0; index < $scope.scenicSpot.pictures.length; index++) {
                    if ($scope.scenicSpot.pictures[index].id === picId) {
                        $scope.scenicSpot.pictures.splice(index, 1);
                        break;
                    }
                }
            });
        };

        //新建执行地时添加tips
        $scope.addTip = function (update) {
            if (update === 'update') {
                $scope.scenicSpot.tips.push({text: $scope.newTip});
            } else {
                $scope.newScenicSpot.tips.push($scope.newTip);
            }
            $scope.newTip = '';
        };
        //删除执行地的tips
        $scope.deleteTip = function (index, update) {
            if (update === 'update') {
                $scope.scenicSpot.tips.splice(index, 1);
            } else {
                $scope.newScenicSpot.tips.splice(index, 1);
            }
        };

        $scope.selectImg = function (imgPath) {
            $scope.selectedImg = 'http://7xijtn.com1.z0.glb.clouddn.com/' + imgPath;
            var image = new Image();
            image.src = $scope.selectedImg;
            $scope.selectedImgWidth = image.width;
            $scope.selectedImageHeight = image.height;

        };

        $scope.checkScenicSpot = function (result) {
            $http.post('/scenic-spots/' + $scope.scenicSpot.id + '/checked-scenicSpot', {
                checkedResult: result
            }).success(function () {
                $location.path('scenic-spots/check');
            }).error(function (data) {
                window.alert(data.message);
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
                uptoken_url: '/qiniu/scenicspot-image-upload-token',
                domain: 'http://7xijtn.com1.z0.glb.clouddn.com/',
                // downtoken_url: '/downtoken',
                // unique_names: true,
                save_key: true,

                max_file_size: '10mb',
                filters: [{title: 'Image files', extensions: 'jpg,jpeg,gif,png'}],
                x_vars: {
                    'id': $stateParams.scenicSpotId
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
                            $scope.scenicSpot.pictures.push(picPattern);
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

'use strict';

//Scenic spots service used to communicate Scenic spots REST endpoints
angular.module('scenic-spots').factory('ScenicSpots', ['$resource',
    function ($resource) {
        return $resource('scenic-spots/:scenicSpotId', {
            scenicSpotId: '@id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);

angular.module('scenic-spots').factory('Pictures', ['$resource',
    function ($resource) {
        return $resource('pictures/:pictureId/on-main-page', {
            pictureId: '@id'
        }, {
            update: {
                method: 'PUT'
            },
            setOnMainPage: {

            }
        });
    }
]);

'use strict';

// Configuring the Articles module
angular.module('task-lists').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', '玩鲜线路', 'task-lists', 'dropdown', '/task-lists(/create)?', false, ['admin'], 3);
		Menus.addSubMenuItem('topbar', 'task-lists', '创建玩鲜线路', 'task-lists/create', null, false, ['admin']);
		Menus.addSubMenuItem('topbar', 'task-lists', '玩鲜线路列表', 'task-lists', null, false, ['admin']);
	}
]);

'use strict';

//Setting up route
angular.module('task-lists').config(['$stateProvider',
	function($stateProvider) {
		// Task lists state routing
		$stateProvider.
		state('listTaskLists', {
			url: '/task-lists',
			templateUrl: 'modules/task-lists/views/list-task-lists.client.view.html'
		}).
		state('createTaskList', {
			url: '/task-lists/create',
			templateUrl: 'modules/task-lists/views/create-task-list.client.view.html'
		}).
		state('editTaskList', {
			url: '/task-lists/:taskListId/edit',
			templateUrl: 'modules/task-lists/views/edit-task-list.client.view.html'
		});
	}
]);

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

'use strict';

//Task lists service used to communicate Task lists REST endpoints
angular.module('task-lists').factory('TaskLists', ['$resource',
	function($resource) {
		return $resource('task-lists/:taskListId', { taskListId: '@id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

'use strict';

// Configuring the Articles module
angular.module('tasks').run(['Menus',
    function (Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', '任务', 'tasks', 'dropdown', '/tasks(/create)?', false, ['admin'], 2);
        Menus.addSubMenuItem('topbar', 'tasks', '创建新任务', 'tasks/create', null, false, ['admin']);
        Menus.addSubMenuItem('topbar', 'tasks', '所有任务', 'tasks', null, false, ['admin']);
    }
]);

'use strict';

//Setting up route
angular.module('tasks').config(['$stateProvider',
	function($stateProvider) {
		// Tasks state routing
		$stateProvider.
		state('listTasks', {
			url: '/tasks',
			templateUrl: 'modules/tasks/views/list-tasks.client.view.html'
		}).
		state('createTask', {
			url: '/tasks/create',
			templateUrl: 'modules/tasks/views/create-task.client.view.html'
		}).
		state('editTask', {
			url: '/tasks/:taskId/edit',
			templateUrl: 'modules/tasks/views/edit-task.client.view.html'
		});
	}
]);

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

'use strict';

//Tasks service used to communicate Tasks REST endpoints
angular.module('tasks').factory('Tasks', ['$resource',
	function($resource) {
		return $resource('tasks/:taskId', { taskId: '@id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

angular.module('tasks').factory('TasksVerify', ['$resource',
    function($resource) {
        return $resource('tasks/:taskId/verify-code', {
            taskId: '@id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);

angular.module('tasks').factory('TasksGrant', ['$resource',
    function($resource) {
        return $resource('tasks/:taskId/grant-awards', { taskId: '@id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);

angular.module('tasks').factory('TasksQuota', ['$resource',
    function($resource) {
        return $resource('tasks/:taskId/add-quota', {
            taskId: '@id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);

'use strict';

// Configuring the Articles module
angular.module('user-feedbacks').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', '用户反馈', 'user-feedbacks', 'dropdown', '/user-feedbacks(/create)?', false, ['unavaliable'], 12);
		Menus.addSubMenuItem('topbar', 'user-feedbacks', '用户反馈列表', 'user-feedbacks');
	}
]);

'use strict';

//Setting up route
angular.module('user-feedbacks').config(['$stateProvider',
	function($stateProvider) {
		// User feedbacks state routing
		$stateProvider.
		state('listUserFeedbacks', {
			url: '/user-feedbacks',
			templateUrl: 'modules/user-feedbacks/views/list-user-feedbacks.client.view.html'
		}).
		state('viewUserFeedback', {
			url: '/user-feedbacks/:userFeedbackId',
			templateUrl: 'modules/user-feedbacks/views/view-user-feedback.client.view.html'
		});
	}
]);

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

'use strict';

//User feedbacks service used to communicate User feedbacks REST endpoints
angular.module('user-feedbacks').factory('UserFeedbacks', ['$resource',
	function($resource) {
		return $resource('user-feedbacks/:userFeedbackId', { userFeedbackId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Configuring the Articles module
angular.module('user-management').run(['Menus',
    function (Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', '用户管理', 'user-management', 'dropdown', '/users(/create)?', false, ['admin'], 11);
        //Menus.addSubMenuItem('topbar', 'user-management', '查看所有用户', 'users');
        Menus.addSubMenuItem('topbar', 'user-management', '创建用户', 'users/create');
        Menus.addSubMenuItem('topbar', 'user-management', '查看商家', 'tenants');
        Menus.addSubMenuItem('topbar', 'user-management', '查看用户记录', 'user-operation-records');
        Menus.addSubMenuItem('topbar', 'user-management', '举报列表', 'objection-reports');
        Menus.addSubMenuItem('topbar', 'user-management', '用户反馈列表', 'user-feedbacks');
    }
]);

'use strict';

//Setting up route
angular.module('user-management').config(['$stateProvider',
    function ($stateProvider) {
        // Tags state routing
        $stateProvider.
            state('listUsers', {
                url: '/users',
                templateUrl: 'modules/user-management/views/list-users.client.view.html'
            }).
            state('createUsers', {
                url: '/users/create',
                templateUrl: 'modules/user-management/views/create-user.client.view.html'
            }).
            state('viewUser', {
                url: '/users/:userId',
                templateUrl: 'modules/user-management/views/view-user.client.view.html'
            }).
            state('viewTenant', {
                url: '/tenants',
                templateUrl: 'modules/user-management/views/list-tenant.client.view.html'
            }).
            state('viewUserOperationRecords', {
                url: '/user-operation-records',
                templateUrl: 'modules/user-management/views/user-operation-records.client.view.html'
            });
    }
]);

'use strict';

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

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
    function ($httpProvider) {
        // Set the httpProvider "not authorized" interceptor
        $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
            function ($q, $location, Authentication) {
                return {
                    responseError: function (rejection) {
                        switch (rejection.status) {
                            case 401:
                                // Deauthenticate the global user
                                Authentication.user = null;

                                // Redirect to signin page
                                $location.path('signin');
                                break;
                            case 403:
                                // Add unauthorized behaviour
                                break;
                        }

                        return $q.reject(rejection);
                    }
                };
            }
        ]);
    }
]);

'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
    function ($stateProvider) {
        // Users state routing
        $stateProvider.
            state('profile', {
                url: '/settings/profile',
                templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
            }).
            state('password', {
                url: '/settings/password',
                templateUrl: 'modules/users/views/settings/change-password.client.view.html'
            }).
            state('accounts', {
                url: '/settings/accounts',
                templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
            }).
            state('signup', {
                url: '/signup',
                templateUrl: 'modules/users/views/authentication/signup.client.view.html'
            }).
            state('signin', {
                url: '/signin',
                templateUrl: 'modules/users/views/authentication/signin.client.view.html'
            }).
            state('forgot', {
                url: '/password/forgot',
                templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
            }).
            state('reset-invalid', {
                url: '/password/reset/invalid',
                templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
            }).
            state('reset-success', {
                url: '/password/reset/success',
                templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
            }).
            state('reset', {
                url: '/password/reset/:token',
                templateUrl: 'modules/users/views/password/reset-password.client.view.html'
            });
    }
]);

'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$http', '$location', 'Authentication',
    function ($scope, $http, $httpProvider, $location, Authentication) {
        $scope.authentication = Authentication;

        // If user is signed in then redirect back home
        if ($scope.authentication.user) $location.path('/');

        $scope.signup = function () {
            $http.post('/auth/signup', $scope.credentials).success(function (response) {
                // If successful we assign the response to the global user model
                $scope.authentication.user = response.user;

                // And redirect to the index page
                $location.path('/');
            }).error(function (response) {
                $scope.error = response.message;
            });
        };

        $scope.signin = function () {
            $http.post('/auth/signin-web', $scope.credentials).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                if (response.statusCode !== 0) {
                    $scope.error = response.message;
                } else {
                    $scope.authentication.user = response.user;
                    $location.path('/');
                }

            });
        };
    }
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
    function ($scope, $stateParams, $http, $location, Authentication) {
        $scope.authentication = Authentication;

        //If user is signed in then redirect back home
        if ($scope.authentication.user) $location.path('/');

        // Submit forgotten password account id
        $scope.askForPasswordReset = function () {
            $scope.success = $scope.error = null;

            $http.post('/auth/forgot', $scope.credentials).success(function (response) {
                // Show user success message and clear form
                $scope.credentials = null;
                $scope.success = response.message;

            }).error(function (response) {
                // Show user error message and clear form
                $scope.credentials = null;
                $scope.error = response.message;
            });
        };

        // Change user password
        $scope.resetUserPassword = function () {
            $scope.success = $scope.error = null;

            $http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
                // If successful show success message and clear form
                $scope.passwordDetails = null;

                // Attach user profile
                Authentication.user = response;

                // And redirect to the index page
                $location.path('/password/reset/success');
            }).error(function (response) {
                $scope.error = response.message;
            });
        };
    }
]);

'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
    function ($scope, $http, $location, Users, Authentication) {
        $scope.user = Authentication.user;

        // If user is not signed in then redirect back home
        if (!$scope.user) $location.path('/');

        // Check if there are additional accounts
        $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
            for (var i in $scope.user.additionalProvidersData) {
                return true;
            }

            return false;
        };

        // Check if provider is already in use with current user
        $scope.isConnectedSocialAccount = function (provider) {
            return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
        };

        // Remove a user social account
        $scope.removeUserSocialAccount = function (provider) {
            $scope.success = $scope.error = null;

            $http.delete('/users/accounts', {
                params: {
                    provider: provider
                }
            }).success(function (response) {
                // If successful show success message and clear form
                $scope.success = true;
                $scope.user = Authentication.user = response;
            }).error(function (response) {
                $scope.error = response.message;
            });
        };

        // Update a user profile
        $scope.updateUserProfile = function (isValid) {
            if (isValid) {
                $scope.success = $scope.error = null;
                var user = new Users($scope.user);

                user.$update(function (response) {
                    console.log(response);
                    if(response.statusCode === 0){
                        $scope.success = true;
                    }
                }, function (response) {
                    $scope.error = response.data.message;
                });
            } else {
                $scope.submitted = true;
            }
        };

        // Change user password
        $scope.changeUserPassword = function () {
            $scope.success = $scope.error = null;

            $http.post('/users/password', $scope.passwordDetails).success(function (response) {
                // If successful show success message and clear form
                window.alert('密码修改成功！请重新登陆');
                Authentication.user=null;
                $location.path('/signin');
            }).error(function (response) {
                $scope.error = response.message;
            });
        };
    }
]);

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [
    function () {
        var _this = this;

        _this._data = {
            user: window.user
        };

        return _this._data;
    }
]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
    function ($resource) {
        return $resource('users', {}, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
