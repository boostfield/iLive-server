/**
 * Created by wangerbing on 15-6-5.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Province = mongoose.model('Province'),
    Picture = mongoose.model('Picture'),
    _ = require('lodash'),
    config = require('../../config/config'),
    ScenicSpot = mongoose.model('ScenicSpot'),
    User = mongoose.model('User'),
    statusCode = require('../utils/status-code'),
    async = require('async'),
    Task = mongoose.model('Task'),
    TaskList = mongoose.model('TaskList'),
    Comment = mongoose.model('Comment');

/**
 *对图片进行点喜欢
 **/
exports.likePicture = function (req, res) {
    var picture = req.picture;
    if (picture.like.indexOf(req.user.id) !== -1) {
        return res.status(200).jsonp({
            statusCode: statusCode.ALREADY_VOTED.statusCode,
            message: 'You already liked the picture!'
        });
    }
    User.findById(picture.belongToUser, {blackList: 1}).exec(function (err, user) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else if (req.user.inUserBlackList(user)) {
            return res.status(200).jsonp(statusCode.ACTION_BLOCKED);
        }
        picture.like.unshift(req.user._id);
        picture.likeCount++;
        picture.save(function (err) {
            if (err) {
                return res.status(200).jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: errorHandler.getErrorMessage(err)
                });
            }
            else {
                return res.jsonp({
                    statusCode: statusCode.SUCCESS.statusCode
                });
            }
        });
    });
};
/**
 *对图片取消喜欢
 **/
exports.dislikePicture = function (req, res) {
    var picture = req.picture;
    if (picture.like.indexOf(req.user.id) === -1) {
        return res.status(200).jsonp({
            statusCode: statusCode.DATABASE_ERROR.statusCode,
            message: 'You didn\'t add like to the picture.'
        });
    }
    picture.like.splice(picture.like.indexOf(req.user.id), 1);
    picture.likeCount--;
    picture.save(function (err) {
        if (err) {
            return res.jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {

            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode
            });

        }
    });
};

/**
 *通过coverUrl读取图片详情。
 */
exports.read = function (req, res) {
    Picture.findOne({'_id': req.params.pictureId, 'isDeleted': {$ne: true}}, {'comment': 0}).populate([
        {
            path: 'belongToUser',
            select: {
                'displayName': 1,
                'avatarUrl': 1,
                '_id': 1,
                'username': 1,
                'gender': 1
            }
        },
        {path: 'belongToScenicSpot', select: {'name': 1, '_id': 1, 'coverUrl': 1, 'album': 1}},
        {
            path: 'like',
            select: {
                'displayName': 1,
                'avatarUrl': 1,
                '_id': 1,
                'username': 1,
                'gender': 1
            }
        }
    ]).exec(function (err, picture) {
        if (err) {
            return res.jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        }
        if (!picture) {
            return res.status(200).jsonp(statusCode.PICTURE_NOT_EXIST);
        }
        else {
            picture = JSON.parse(JSON.stringify(picture));
            if (JSON.stringify(picture.like).indexOf(req.user.id) !== -1) {
                picture.likeStatus = true;
            } else {
                picture.likeStatus = false;
            }
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                picture: picture
            });
        }
    });
};

exports.setOnMainPage = function (req, res) {
    if (typeof req.body.isOnMainPage !== 'boolean') {
        return res.jsonp(statusCode.PARSING_ERR);
    }
    async.waterfall([
            function (cb) {
                Task.findOne({
                    'belongToScenicSpot': req.picture.belongToScenicSpot,
                    'isDeleted': {$ne: true}
                }).exec(function (err, task) {
                    if (err) {
                        cb({
                            statusCode: statusCode.DATABASE_ERROR.statusCode,
                            message: 'Get task err!'
                        });
                    } else {
                        if (!task) {
                            cb({
                                statusCode: statusCode.DATABASE_ERROR.statusCode,
                                message: 'The picture does not belong to  any task !'
                            });
                        } else {
                            cb(null, task);
                        }
                    }
                });
            },
            function (task, cb) {
                TaskList.findOne({'tasks': task._id, 'isDeleted': {$ne: true}}, function (err) {
                    if (err) {
                        cb(err);
                    } else {
                        if (!task) {
                            cb({
                                statusCode: statusCode.DATABASE_ERROR.statusCode,
                                message: 'The picture does not belong to  any task !'
                            });
                        } else {
                            cb();
                        }
                    }
                });
            },
            function (cb) {
                req.picture.isOnMainPage = req.body.isOnMainPage;
                req.picture.save(function (err) {
                    if (err) {
                        cb.jsonp(err);
                    } else {
                        cb();
                    }
                });
            }],
        function (err) {
            if (err) {
                return res.status(200).jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: err.message
                });
            } else {
                return res.jsonp(statusCode.SUCCESS);
            }
        });
};

/**
 * 我的美图列表
 */
exports.getMyPictureList = function (req, res) {
    var pageSize = req.query.pageSize ? req.query.pageSize : 10;
    var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
    Picture.find({'belongToUser': req.user.id, 'isDeleted': {$ne: true}}, {'comment': 0}).populate([
        {path: 'belongToScenicSpot', select: {'name': 1, '_id': 1}}
    ]).skip(pageSize * pageNumber)
        .limit(pageSize)
        .exec(function (err, pictures) {
            if (err) {
                return res.jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                Picture.find({'belongToUser': req.user.id, 'isDeleted': {$ne: true}})
                    .count(function (err_count, count) {
                        if (err_count) {
                            return res.jsonp({
                                statusCode: statusCode.DATABASE_ERROR.statusCode,
                                message: errorHandler.getErrorMessage(err_count)
                            });
                        } else {
                            return res.jsonp({
                                statusCode: statusCode.SUCCESS.statusCode,
                                total: count,
                                picture: pictures
                            });
                        }
                    });
            }
        });
};
/**
 * 给图片点赞的人列表
 */
exports.getLikeUser = function (req, res) {
    var pageSize = parseInt(req.query.pageSize) ? parseInt(req.query.pageSize) : 10;
    var pageNumber = parseInt(req.query.pageNumber) ? parseInt(req.query.pageNumber) : 0;
    Picture.findOne({'_id': req.params.pictureId, 'isDeleted': {$ne: true}}).populate([
        {
            path: 'like',
            select: {
                'displayName': 1,
                'avatarUrl': 1,
                '_id': 1,
                'username': 1,
                'gender': 1
            }
        }
    ]).exec(function (err, picture) {
        if (err) {
            return res.jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        }
        if (!picture) {
            return res.jsonp(statusCode.PICTURE_NOT_EXIST);
        }
        else {
            var likedUser = picture.like.splice(pageNumber * pageSize, pageSize);
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                total: likedUser.length,
                users: likedUser
            });
        }
    });
};
/**
 * 通过CoverUrl删除图片，同时删除图片事件，删除评论
 * 删除：更新isDeleted字段为‘true’
 */
var deletePicture = function (pictureId, callback) {
    async.waterfall([
            function (cb) {
                Picture.findOne({_id: pictureId, isDeleted: {$ne: true}}).exec(function (err, picture) {
                    if (err) {
                        cb(err);
                    } else if (!picture) {
                        cb({
                            statusCode: statusCode.DATABASE_ERROR.statusCode,
                            message: 'The picture does not exist.'
                        });
                    } else {
                        cb(null, picture);
                    }
                });
            },
            function (picture, cb) {
                Comment.update({toPicture: picture._id}, {isDeleted: true}, {multi: true}, function (err) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, picture);
                    }
                });
            },
            function (picture, cb) {
                ScenicSpot.findByIdAndUpdate(picture.belongToScenicSpot, {$pull: {'pictures': picture._id}}, function (err) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, picture);
                    }
                });
            },
            function (picture, cb) {
                picture.isDeleted = true;
                picture.save(function (err) {
                    if (err) {
                        cb(err);
                    } else {
                        cb();
                    }
                });
            }
        ],
        function (err) {
            if (err) {
                callback(statusCode.DATABASE_ERROR);
            } else {
                callback(null, statusCode.SUCCESS);
            }
        });
};
exports.deletePicture = deletePicture;

exports.deletePictureWithRes = function (req, res) {
    deletePicture(req.picture.id, function (err, result) {
        if (err) {
            return res.jsonp(err);
        } else {
            return res.jsonp(result);
        }
    });
};
/**
 * 管理后台删除任务图片
 * 删除：更新isDeleted字段为‘true’
 */
exports.deleteTaskPicture = function (req, res) {
    async.waterfall([
            function (cb) {
                Picture.findOne({_id: req.params.pictureId, isDeleted: {$ne: true}}).exec(function (err, picture) {
                    if (err) {
                        cb(err);
                    } else if (!picture) {
                        cb({
                            statusCode: statusCode.DATABASE_ERROR.statusCode,
                            message: 'The picture does not exist.'
                        });
                    } else {
                        cb(null, picture);
                    }
                });
            },
            function (picture, cb) {
                Comment.update({toPicture: picture._id}, {isDeleted: true}, {multi: true}, function (err) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, picture);
                    }
                });
            },
            function (picture, cb) {
                Task.findByIdAndUpdate(picture.belongToTask, {$pull: {'pictures': picture._id ? picture._id : picture.id}}, function (err) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, picture);
                    }
                });
            },
            function (picture, cb) {
                picture.isDeleted = true;
                picture.save(function (err) {
                    if (err) {
                        cb(err);
                    } else {
                        cb();
                    }
                });
            }
        ],
        function (err) {
            if (err) {
                return res.jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: err.message
                });
            } else {
                return res.jsonp({
                    statusCode: statusCode.SUCCESS.statusCode
                });
            }
        });
};

exports.pictureByID = function (req, res, next, id) {
    Picture.findOne({_id: id, 'isDeleted': {$ne: true}}).exec(function (err, picture) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        }
        if (!picture) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: 'The picture doesn\'t exist.'
            });
        }
        req.picture = picture;
        next();
    });
};

exports.updateMessage = function (req, res) {
    Picture.findOneAndUpdate({_id: req.params.pictureId}, {$set: {'pictureMessage': req.query.pictureMessage}}).exec(function (err, picture) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        }
        if (!picture) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: 'The picture doesn\'t exist.'
            });
        } else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode
            });
        }
    });
};

/**
 * Banner authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    if (req.picture.belongToUser.equals(req.user.id) || req.user.roles.indexOf('admin') !== -1 || req.user.roles.indexOf('editor') !== -1) {
        next();
    } else {
        return res.status(403).jsonp(statusCode.NOT_AUTHORIZED);
    }

};

//exports.restoreAlbumToPictures = function (req, res) {
//    async.waterfall([
//            //查询更新总数
//            function (callback) {
//                ScenicSpot.count({album: {$ne: null}, dumped: {$ne: true}}).exec(function (err, total) {
//                    if (err) {
//                        callback(err);
//                    } else {
//                        callback(null, total);
//                    }
//                });
//            },
//            function (total, callback) {
//                console.log('there are ' + total + ' in total.');
//                var scenicspotCount = 0;
//                async.whilst(
//                    function () {
//                        return scenicspotCount < total;
//                    },
//                    function (callbackScenic) {
//                        ScenicSpot.find({album: {$ne: null}, dumped: {$ne: true}})
//                            .skip(scenicspotCount)
//                            .limit(1)
//                            .exec(function (err, scenicSpot) {
//                                if (err) {
//                                    callbackScenic(err);
//                                } else if (!scenicSpot[0]) {
//                                    scenicspotCount++;
//                                    callbackScenic();
//                                } else {
//                                    var albumCount = 0;
//                                    async.whilst(
//                                        function () {
//                                            return albumCount < scenicSpot[0].album.length;
//                                        },
//                                        function (callbackAlbum) {
//                                            var picture = new Picture();
//                                            picture.coverUrl = scenicSpot[0].album[albumCount];
//                                            picture.belongToUser = config.liulianAdmin;
//                                            picture.belongToScenicSpot = scenicSpot[0]._id;
//                                            picture.pictureType = 'system';
//                                            picture.save(function (err, picture) {
//                                                if (err) {
//                                                    callbackAlbum(err);
//                                                } else {
//                                                    scenicSpot[0].pictures.push(picture._id);
//                                                    console.log(picture.id + 'saved as picture');
//                                                    albumCount++;
//                                                    callbackAlbum();
//                                                }
//                                            });
//                                        },
//                                        function (err) {
//                                            if (err) {
//                                                callbackScenic(err);
//                                            } else {
//                                                scenicSpot[0].dumped = true;
//                                                scenicSpot[0].save(function (err) {
//                                                    if (err) {
//                                                        callbackScenic(err);
//                                                    }
//                                                    console.log(scenicSpot[0].name + ' saved.');
//                                                    scenicspotCount++;
//                                                    callbackScenic();
//                                                });
//                                            }
//                                        }
//                                    );
//
//                                }
//                            });
//                    },
//                    function (err) {
//                        if (err) {
//                            callback(err);
//                        } else {
//                            callback();
//                        }
//                    }
//                );
//            }
//        ],
//        function (err) {
//            if (err) {
//                return res.status(200).jsonp({
//                    statusCode: statusCode.DATABASE_ERROR.statusCode,
//                    message: errorHandler.getErrorMessage(err)
//                });
//            } else {
//                console.log('all Done!');
//
//                return res.jsonp(statusCode.SUCCESS);
//            }
//        });
//};

