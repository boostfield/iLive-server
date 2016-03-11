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
                $http.delete('banners/' + $scope.bannerToDelete.id).then(function (data) {
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
                $location.path('banners/' + banner.id);
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
                domain: 'http://7xrq05.com1.z0.glb.clouddn.com',
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
