'use strict';
var qiniu = require('qiniu'),
    config = require('../../config/config'),
    statusCode = require('../utils/status-code'),
    errorHandler = require('./errors.server.controller'),
    mongoose = require('mongoose'), passport = require('passport'),
    City = mongoose.model('City'),
    ScenicSpot = mongoose.model('ScenicSpot'),
    User = mongoose.model('User'),
    Picture = mongoose.model('Picture'),
    TaskList = mongoose.model('TaskList'),
    Task = mongoose.model('Task'),
    Banner = mongoose.model('Banner'),
    request = require('request'),
    async = require('async');

exports.getUploadToken = function (req, res) {
    var uploadPolicy = new qiniu.rs.PutPolicy(config.qiniu.testBucketName,
        config.qiniu.callbackUrl, config.qiniu.userCallbackBody);
    uploadPolicy.deadline = Date.parse(new Date()) % 1000 + config.qiniu.expireSpan * 24 * 3600;
    res.jsonp({
        statusCode: statusCode.SUCCESS.statusCode,
        uploadToken: uploadPolicy.token()
    });
};

function transferFileFromUrl(url, key, cb) {
    var uploadPolicy = new qiniu.rs.PutPolicy(config.qiniu.testBucketName, config.qiniu.cityImageCallbackUrl, config.qiniu.citiesCallbackBody);
    uploadPolicy.deadline = Date.parse(new Date()) % 1000 + config.qiniu.expireSpan * 24 * 3600;
    var uploadToken = uploadPolicy.token();

    var formData = {
        token: uploadToken,
        file: request.get(url),
        key: key
    };
    request.post({url: 'http://upload.qiniu.com/', formData: formData}, function (err, result) {
        if (err) {
            return cb(err);
        } else {
            return cb(null, result.body);
        }
    });
}

exports.transferPicFromUrl = transferFileFromUrl;
exports.transferPic = function (req, res) {
    transferFileFromUrl(req.body.url, req.body.key, function(err, result){
        if(err){
            return res.jsonp({
                statusCode:statusCode.DATABASE_ERROR.statusCode,
                message:err.message
            });
        }else{
            return res.jsonp(result.body);
        }
    });
};
exports.getCityImageUploadToken = function (req, res) {
    var uploadPolicy = new qiniu.rs.PutPolicy(config.qiniu.publicBucketName, config.qiniu.cityImageCallbackUrl, config.qiniu.citiesCallbackBody);
    uploadPolicy.deadline = Date.parse(new Date()) % 1000 + config.qiniu.expireSpan * 24 * 3600;
    res.jsonp({
        statusCode: statusCode.SUCCESS.statusCode,
        uptoken: uploadPolicy.token()
    });
};

exports.getScenicSpotUploadToken = function (req, res) {
    var uploadPolicy = new qiniu.rs.PutPolicy(config.qiniu.publicBucketName, config.qiniu.scenicSpotCallbackUrl, config.qiniu.scenicSpotCallbackBody);
    uploadPolicy.deadline = Date.parse(new Date()) % 1000 + config.qiniu.expireSpan * 24 * 3600;
    res.jsonp({
        statusCode: statusCode.SUCCESS.statusCode,
        uptoken: uploadPolicy.token()
    });
};

exports.getBannerUploadToken = function (req, res) {
    var uploadPolicy = new qiniu.rs.PutPolicy(config.qiniu.publicBucketName, config.qiniu.bannerCallbackUrl, config.qiniu.bannerCallbackBody);
    uploadPolicy.deadline = Date.parse(new Date()) % 1000 + config.qiniu.expireSpan * 24 * 3600;
    res.jsonp({
        statusCode: statusCode.SUCCESS.statusCode,
        uptoken: uploadPolicy.token()
    });
};

exports.getTaskListCoverUploadToken = function (req, res) {
    var uploadPolicy = new qiniu.rs.PutPolicy(config.qiniu.publicBucketName, config.qiniu.taskListCallbackUrl, config.qiniu.taskListCallbackBody);
    uploadPolicy.deadline = Date.parse(new Date()) % 1000 + config.qiniu.expireSpan * 24 * 3600;
    res.jsonp({
        statusCode: statusCode.SUCCESS.statusCode,
        uptoken: uploadPolicy.token()
    });
};

exports.setTaskListCoverUrl = function (req, res) {
    TaskList.findOneAndUpdate({_id: req.body.taskListId}, {$set: {coverUrl: req.body.key}}, function (err) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.UPLOAD_IMAGE_FAILED.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                path: req.body.key
            });
        }
    });
};

exports.saveUserUploadImage = function (req, res) {
    var userId = req.body.id;
    if (req.body.type === 'album') {
        User.findOneAndUpdate({_id: userId}, {$push: {'album': req.body.key}}, function (err, user) {
            if (!err) {
                return res.jsonp({
                    statusCode: statusCode.SUCCESS.statusCode,
                    path: req.body.key,
                    type: 'album'
                });
            } else {
                return res.jsonp({
                    statusCode: statusCode.UPLOAD_IMAGE_FAILED.statusCode,
                    message: errorHandler.getErrorMessage(err)
                });
            }
        });
    } else if (req.body.type === 'avatar') {
        User.findOneAndUpdate({_id: userId}, {$set: {avatarUrl: req.body.key}}, function (err) {
            if (!err) {
                return res.jsonp({
                    statusCode: statusCode.SUCCESS.statusCode,
                    path: req.body.key,
                    type: 'avatar'
                });
            } else {
                return res.jsonp({
                    statusCode: statusCode.UPLOAD_AVATAR_FAILED.statusCode,
                    message: errorHandler.getErrorMessage(err)
                });
            }
        });
    }

};

exports.saveCityImage = function (req, res) {
    var cityId = req.body.id;
    City.findOneAndUpdate({_id: cityId}, {$addToSet: {'album': req.body.key}, coverUrl: req.body.key}, function (err) {
        if (!err) {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                key: req.body.key,
                hash: req.body.hash,
                type: 'city'
            });
        } else {
            return res.status(200).jsonp({
                statusCode: statusCode.UPLOAD_IMAGE_FAILED.statusCode,
                key: req.body.key,
                hash: req.body.hash,
                message: errorHandler.getErrorMessage(err)
            });
        }
    });

};

exports.saveScenicSpotImage = function (req, res) {
    var scenicSpotId = req.body.id;
    var picture = new Picture();
    picture.coverUrl = req.body.key;
    picture.belongToUser = config.liulianAdmin;
    picture.belongToScenicSpot = req.body.id;
    picture.pictureType = 'system';
    //req.body.userId和req.body.scenicSpotId是 1.我们前端拿到qiniu的Token 2.前端传图+传一些数据到qiniu  3.qiniu回调，把我们前端传的数据回调传个服务器
    async.waterfall([
            function (cb) {
                picture.save(function (err, savedPicture) {
                    if (err) {
                        cb({
                            statusCode: statusCode.UPLOAD_IMAGE_FAILED.statusCode,
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        cb(null, savedPicture);
                    }
                });
            },
            function (savedPicture, cb) {
                if (req.body.type === 'cover') {
                    ScenicSpot.findOneAndUpdate({_id: scenicSpotId}, {
                        coverUrl: req.body.key, $addToSet: {'pictures': savedPicture._id}
                    }, function (err) {
                        if (err) {
                            cb({
                                statusCode: statusCode.UPLOAD_IMAGE_FAILED.statusCode,
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            cb(null, {
                                statusCode: statusCode.SUCCESS.statusCode,
                                path: req.body.key,
                                type: 'scenicSpot'
                            });
                        }
                    });
                } else {
                    ScenicSpot.findOneAndUpdate({_id: scenicSpotId}, {
                        $push: {
                            pictures: {
                                $each: [picture._id],
                                $position: 0
                            }
                        }
                    }, function (err) {
                        if (err) {
                            cb({
                                statusCode: statusCode.UPLOAD_IMAGE_FAILED.statusCode,
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            cb(null, {
                                statusCode: statusCode.SUCCESS.statusCode,
                                savedPicture: savedPicture,
                                type: 'scenicSpot'
                            });
                        }
                    });
                }
            }
        ],
        function (err, result) {
            if (err) {
                return res.status(200).jsonp(err);
            } else {
                return res.jsonp(result);
            }
        });
};

exports.addBannerPicture = function (req, res) {
    var bannerId = req.body.bannerId;
    Banner.findOneAndUpdate({_id: bannerId}, {'coverUrl': req.body.key}, function (err) {
        if (!err) {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                key: req.body.key,
                hash: req.body.hash,
                type: 'banner'
            });
        } else {
            return res.jsonp({
                statusCode: statusCode.UPLOAD_IMAGE_FAILED.statusCode,
                key: req.body.key,
                hash: req.body.hash,
                message: errorHandler.getErrorMessage(err)
            });
        }
    });
};

exports.getPictureUploadToken = function (req, res) {
    var uploadPolicy = new qiniu.rs.PutPolicy(config.qiniu.publicBucketName, config.qiniu.pictureCallbackUrl, config.qiniu.pictureCallbackBody);
    uploadPolicy.deadline = Date.parse(new Date()) % 1000 + config.qiniu.expireSpan * 24 * 3600;
    console.dir(uploadPolicy.token());
    res.jsonp({
        statusCode: statusCode.SUCCESS.statusCode,
        uploadToken: uploadPolicy.token()
    });
};

/**
 * 单独上传景点图片，（非创建景点时的打包上传）
 * 存在scenicSpot.pictures中，同时生成：1.picture 2.pictureEvent
 **/

exports.addPicture = function (req, res) {
    var picture = new Picture();
    picture.coverUrl = req.body.key;
    picture.belongToUser = req.body.userId;
    picture.belongToScenicSpot = req.body.scenicSpotId;
    picture.pictureMessage = req.body.pictureMessage;
    async.waterfall([
        function (cb) {
            picture.save(function (err) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, picture);
                }
            });
        },
        function (picture, cb) {
            ScenicSpot.findByIdAndUpdate(req.body.scenicSpotId, {
                $push: {
                    pictures: {
                        $each: [picture._id],
                        $position: 0
                    }
                }
            }, function (err) {
                if (err) {
                    cb(err);
                } else {
                    cb(null);
                }
            });
        }

    ], function (err) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.UPLOAD_IMAGE_FAILED.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                path: req.body.key
            });
        }

    });
};

/**
 * 创造景点时，获取Token
 **/
exports.getScenicSpotUploadTokenByMobile = function (req, res) {
    var uploadPolicy = new qiniu.rs.PutPolicy(config.qiniu.publicBucketName, config.qiniu.scenicSpotByMobileCallbackUrl, config.qiniu.scenicSpotByMobileCallbackBody);
    uploadPolicy.deadline = Date.parse(new Date()) % 1000 + config.qiniu.expireSpan * 24 * 3600;
    res.jsonp({
        statusCode: statusCode.SUCCESS.statusCode,
        uploadToken: uploadPolicy.token()
    });
};

/**
 * 上传景点时候，循环调用，上传图片
 * coverUrl不存在album或者picture中
 * 打包上传图片，不可评论，不可点赞，暂定存在album中。
 **/
exports.saveScenicSpotImageByMobile = function (req, res) {
    var scenicSpotId = req.body.id;
    var picture = new Picture();
    picture.coverUrl = req.body.key;
    picture.belongToUser = req.body.userId;
    picture.belongToScenicSpot = req.body.id;
    picture.pictureType = 'custom';
    if (req.body.pictureMessage) {
        picture.pictureMessage = req.body.pictureMessage;
    }
    //req.body.userId和req.body.scenicSpotId是 1.我们前端拿到qiniu的Token 2.前端传图+传一些数据到qiniu  3.qiniu回调，把我们前端传的数据回调传个服务器
    async.waterfall([
            function (cb) {
                picture.save(function (err, savedPicture) {
                    if (err) {
                        cb({
                            statusCode: statusCode.UPLOAD_IMAGE_FAILED.statusCode,
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        cb(null, savedPicture);
                    }
                });
            },
            function (savedPicture, cb) {
                if (req.body.type === 'cover') {
                    ScenicSpot.findOneAndUpdate({_id: scenicSpotId}, {
                        coverUrl: req.body.key, $addToSet: {'pictures': savedPicture._id}
                    }, function (err) {
                        if (err) {
                            cb({
                                statusCode: statusCode.UPLOAD_IMAGE_FAILED.statusCode,
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            cb(null, {
                                statusCode: statusCode.SUCCESS.statusCode,
                                path: req.body.key,
                                type: 'scenicSpot'
                            });
                        }
                    });
                } else {
                    ScenicSpot.findOneAndUpdate({_id: scenicSpotId}, {$addToSet: {'pictures': savedPicture._id}}, function (err) {
                        if (err) {
                            cb({
                                statusCode: statusCode.UPLOAD_IMAGE_FAILED.statusCode,
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            cb(null, {
                                statusCode: statusCode.SUCCESS.statusCode,
                                path: req.body.key,
                                type: 'scenicSpot'
                            });
                        }
                    });
                }
            }
        ],
        function (err, result) {
            if (err) {
                return res.status(200).jsonp(err);
            } else {
                return res.jsonp(result);
            }
        });


};

exports.getTaskUploadToken = function (req, res) {
    var uploadPolicy = new qiniu.rs.PutPolicy(config.qiniu.publicBucketName, config.qiniu.taskCallbackUrl, config.qiniu.taskCallbackBody);
    uploadPolicy.deadline = Date.parse(new Date()) % 1000 + config.qiniu.expireSpan * 24 * 3600;
    res.jsonp({
        statusCode: statusCode.SUCCESS.statusCode,
        uptoken: uploadPolicy.token()
    });
};

/**
 * 上传任务图片
 * coverUrl存在picture中
 **/
exports.addTaskPicture = function (req, res) {
    var picture = new Picture();
    picture.coverUrl = req.body.key;
    picture.belongToUser = config.liulianAdmin;
    picture.belongToTask = req.body.taskId;
    picture.pictureType = 'custom';
    if (req.body.pictureMessage) {
        picture.pictureMessage = req.body.pictureMessage;
    }
    async.waterfall([
            function (cb) {
                picture.save(function (err, savedPicture) {
                    if (err) {
                        cb({
                            statusCode: statusCode.UPLOAD_IMAGE_FAILED.statusCode,
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        cb(null, savedPicture);
                    }
                });
            },
            function (savedPicture, cb) {
                Task.findOneAndUpdate({_id: req.body.taskId}, {$addToSet: {'pictures': savedPicture._id}}, function (err) {
                    if (err) {
                        cb({
                            statusCode: statusCode.UPLOAD_IMAGE_FAILED.statusCode,
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        cb(null, {
                            statusCode: statusCode.SUCCESS.statusCode,
                            savedPicture: savedPicture,
                            type: 'Task'
                        });
                    }
                });
            }
        ],
        function (err, result) {
            if (err) {
                return res.status(200).jsonp(err);
            } else {
                return res.jsonp(result);
            }
        });


};

