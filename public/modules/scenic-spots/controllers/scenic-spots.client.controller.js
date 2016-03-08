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
