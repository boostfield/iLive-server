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
