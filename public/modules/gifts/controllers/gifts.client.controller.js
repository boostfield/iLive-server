'use strict';

// Gifts controller
angular.module('gifts').controller('GiftsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Gifts', '$http',
    function ($scope, $stateParams, $location, Authentication, Gifts, $http) {
        $scope.authentication = Authentication;

        // Create new Gift
        $scope.create = function () {
            // Create new Gift object
            var gift = new Gifts({
                name: this.name,
                cost: this.cost,
                coverUrl: this.coverUrl
            });

            // Redirect after save
            gift.$save(function (response) {
                $location.path('gifts/');

                // Clear form fields
                $scope.name = '';
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing Gift
        $scope.remove = function () {
            if ($scope.giftToDelete) {
                $http.delete('gifts/' + $scope.giftToDelete.id).then(function (data) {
                    for (var i in $scope.gifts) {
                        if ($scope.gifts [i] === $scope.giftToDelete) {
                            $scope.gifts.splice(i, 1);
                            window.alert('gift' + $scope.giftToDelete.title + '删除成功！');
                            $scope.giftToDelete = undefined;
                        }
                    }
                });
            }
        };

        $scope.setGiftToDelete = function (gift) {
            $scope.giftToDelete = gift;
        };

        // Update existing Gift
        $scope.update = function () {
            $http.put('gifts/' + $scope.gift.id, $scope.gift).success(function (data) {
                if (data.statusCode === 0) {
                    window.alert('更新成功! 😊');
                }
            }).error(function (data) {
                $scope.error = data.message;
            });
        };

        // Find a list of Gifts
        $scope.find = function () {
            $http.get('gifts').success(function (data) {
                $scope.gifts = data.gifts;
            }).error(function (err) {
                $scope.error = err.message;
            });
        };

        // Find existing Gift
        $scope.findOne = function () {
            Gifts.get({
                giftId: $stateParams.giftId
            }).$promise.then(function (result) {
                    $scope.gift = result.gift;
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
                uptoken_url: '/qiniu/gift-image-upload-token',
                domain: 'http://7xrq05.com1.z0.glb.clouddn.com',
                save_key: true,
                max_file_size: '1024kb',
                filters: [{title: 'Image files', extensions: 'jpg,jpeg,gif,png'}],
                x_vars: {
                    giftId: $stateParams.giftId
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
                            $scope.gift.coverUrl = infoObj.key;
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
