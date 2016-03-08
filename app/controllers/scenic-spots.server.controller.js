'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    pictureController = require('./pictures.server.controller'),
    ScenicSpot = mongoose.model('ScenicSpot'),
    City = mongoose.model('City'),
    Province = mongoose.model('Province'),
    http = require('http'),
    async = require('async'),
    statusCode = require('../utils/status-code'),
    _ = require('lodash'),
    BroadcastMessage = mongoose.model('BroadcastMessage'),
    User = mongoose.model('User'),
    config = require('../../config/config'),
    JPush = require('jpush-sdk'),
    client = JPush.buildClient(config.jpush.appkey, config.jpush.secret),
    Picture = mongoose.model('Picture'),
    Comment = mongoose.model('Comment');


/**
 * 创建景点，需要审核后才能显示。
 *
 */
exports.create = function (req, res) {
    delete req.body.checked;
    var scenicSpot = new ScenicSpot(req.body);
    scenicSpot.belongToUser = req.user;
    scenicSpot.save(function (err, result) {
        if (err) {
            return res.status(200).send({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        } else {
            res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                scenicSpot: result
            });
        }
    });
};

/**
 * 更新景点。
 * 手机端：类似于create，传入全部内容：1.处理多余信息 2.全部save
 * 网页端：无多余信息，直接save
 */
exports.update = function (req, res) {
    var scenicSpot = req.scenicSpot;
    scenicSpot = _.extend(scenicSpot, req.body);
    scenicSpot.updated = Date.now();
    scenicSpot.save(function (err, result) {
        if (err) {
            console.log(err);
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        } else {
            res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                scenicSpot: result
            });
        }
    });
};

exports.checkInfo = function (req, res) {
    var scenicSpot = req.scenicSpot;
    scenicSpot.checked = req.body.checked;
    scenicSpot.checkedByUser = req.user;
    scenicSpot.save(function (err, scenicSpot) {
        if (err) {
            return res.status(200).send({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                checked: scenicSpot.checked
            });
        }
    });
};

/**
 * Show the current Scenic spot 查看景点详情，网页端使用
 */
exports.read = function (req, res) {
    ScenicSpot.findOne({'_id': req.params.scenicSpotId, isDeleted: {$ne: true}})
        .populate('pictures', 'coverUrl isOnMainPage')
        .exec(function (err, scenicSpot) {
            if (err) {
                return res.jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: 'show the current scenic spot failed!'
                });
            } else {
                res.jsonp({
                    statusCode: statusCode.SUCCESS.statusCode,
                    scenicSpot: scenicSpot
                });
            }
        });
};

/**
 * Show the current Scenic spot。By mobile 查看景点详情，手机端使用。
 */
exports.readByMobile = function (req, res) {
    ScenicSpot.findOne({'_id': req.params.scenicSpotId, checked: 'pass', isDeleted: {$ne: true}}).populate([
        {path: 'city', select: {'name': 1, 'coverUrl': 1, '_id': 1}},
        {path: 'province', select: {'name': 1, '_id': 1}},
        {
            path: 'updatedByUser',
            select: {
                'displayName': 1,
                'username': 1,
                'avatarUrl': 1,
                '_id': 1,
                'gender': 1
            }
        },
        {
            path: 'voteUser',
            select: {
                'displayName': 1,
                'username': 1,
                'avatarUrl': 1,
                '_id': 1,
                'gender': 1
            }
        },
        {
            path: 'belongToUser',
            select: {
                'displayName': 1,
                'username': 1,
                'avatarUrl': 1,
                '_id': 1,
                'gender': 1
            }
        },
        {
            path: 'pictures',
            select: {
                '_id': 1,
                'coverUrl': 1,
                'pictureMessage': 1
            }
        }
    ]).exec(function (err, scenicSpot) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: 'show the current scenic spot failed!'
            });
        } else if (!scenicSpot) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: 'The scenic spot does not exist'
            });
        } else {
            scenicSpot = JSON.parse(JSON.stringify(scenicSpot));
            scenicSpot.likeStatus = false;
            if (JSON.stringify(scenicSpot.voteUser).indexOf(req.user.id) !== -1) {
                scenicSpot.likeStatus = true;
            }
            scenicSpot.photosCount = scenicSpot.pictures.length;
            for (var index = 0; index < scenicSpot.pictures.length; index++) {
                if (scenicSpot.pictures[index].pictureMessage === '') {
                    delete scenicSpot.pictures[index].pictureMessage;
                }
            }
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                scenicSpot: scenicSpot
            });
        }
    });
};

/**
 * 查看景点图片的列表。支持分页
 */
exports.getPictureList = function (req, res) {
    async.parallel({
        total: function (callback) {
            Picture.count({
                belongToScenicSpot: req.params.scenicSpotId,
                'isDeleted': {$ne: true}
            }, function (err, count) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, count);
                }
            });
        },
        pictures: function (callback) {
            var pageSize = req.query.pageSize ? req.query.pageSize : 10;
            var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
            Picture.find({belongToScenicSpot: req.params.scenicSpotId})
                .skip(pageSize * pageNumber)
                .limit(pageSize)
                .exec(function (err, pictures) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, pictures);
                    }
                });
        }
    }, function (err, result) {
        if (err) {
            return res.status(200).send({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.json({
                statusCode: statusCode.SUCCESS.statusCode,
                total: result.total,
                pictures: result.pictures
            });
        }
    });
};

/**
 * 删除一个景点。即：把‘isDeleted’字段更新为‘ture’
 * 同时删除景点事件，评论和相关图片
 */
exports.delete = function (req, res) {
    async.parallel([
            function (cb) {
                Comment.update({'toScenicSpot': req.scenicSpot._id}, {$set: {'isDeleted': true}}).exec(function (err) {
                    if (err) {
                        cb(err);
                    } else {
                        cb();
                    }
                });
            },
            function (cb) {
                var pictureCount = 0;
                async.whilst(
                    function () {
                        return pictureCount < req.scenicSpot.pictures.length;
                    },
                    function (pictureCallback) {
                        pictureController.deletePicture(req.scenicSpot.pictures[pictureCount], function (err) {
                            pictureCount++;
                            pictureCallback();
                        });
                    },
                    function () {
                        cb();
                    }
                );
            },
            function (cb) {
                ScenicSpot.findOneAndUpdate({'_id': req.scenicSpot._id}, {$set: {'isDeleted': true}}).exec(function (err) {
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
                return res.status(200).send({
                    statusCode: statusCode.PARSING_ERR.statusCode,
                    message: err.message
                });
            } else {
                res.jsonp({
                    statusCode: statusCode.SUCCESS.statusCode
                });
            }
        }
    );
};

/**
 * List of Scenic spots
 */
exports.list = function (req, res) {
    var queryObject = {checked: 'pass', isDeleted: {$ne: true}};
    if (req.query.isAuthenticatedTenant) {
        queryObject.isAuthenticatedTenant = req.query.isAuthenticatedTenant;
    }

    if (req.query.isOnMainPage === 'true') {
        queryObject.isOnMainPage = true;
    }
    if (req.query.scenicSpotType) {
        queryObject.dataType = req.query.scenicSpotType;
    }
    if (req.query.cities) {
        var queryCities = req.query.cities.split('-');
        queryObject.city = {$in: queryCities};
    }
    if (req.query.keyword) {
        var queryReg = '';
        try {
            queryReg = new RegExp(req.query.keyword, 'i');
        } catch (err) {
            return res.status(200).send({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        }
        queryObject.name = queryReg;
    }

    async.parallel({
        total: function (callback) {
            ScenicSpot.count(queryObject, function (err, count) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, count);
                }
            });
        },
        scenicSpots: function (callback) {
            var pageSize = req.query.pageSize ? req.query.pageSize : 10;
            var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
            ScenicSpot.find(queryObject, {
                name: 1,
                coverUrl: 1,
                city: 1,
                province: 1,
                belongToUser: 1,
                commentSize: 1,
                voteSize: 1,
                created:1
            })
                .populate('city', 'name coverUrl')
                .populate('belongToUser', 'displayName avatarUrl username gender')
                .populate('province', 'name')
                .sort('-created')
                .skip(pageSize * pageNumber)
                .limit(pageSize)
                .exec(function (err, scenicSpots) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, scenicSpots);
                    }
                });
        }
    }, function (err, result) {
        if (err) {
            return res.status(200).send({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        } else {
            return res.json({
                statusCode: statusCode.SUCCESS.statusCode,
                total: result.total,
                scenicSpots: result.scenicSpots
            });
        }
    });
};


/**
 * Scenic spot authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    if (req.scenicSpot.user.id !== req.user.id) {
        return res.status(403).send('User is not authorized');
    }
    next();
};

/**
 *景点 点赞的人列表
 */
exports.getVoteScenicSpotUsers = function (req, res) {
    var pageSize = parseInt(req.query.pageSize) ? parseInt(req.query.pageSize) : 10;
    var pageNumber = parseInt(req.query.pageNumber) ? parseInt(req.query.pageNumber) : 0;

    ScenicSpot.findOne({'_id': req.params.scenicSpotId, checked: 'pass', 'isDeleted': {$ne: true}}).populate([
        {
            path: 'voteUser', select: {
            'displayName': 1,
            'avatarUrl': 1,
            '_id': 1,
            'username': 1,
            'gender': 1
        }
        }])
        .exec(function (err, scenicSpot) {
            if (err) {
                return res.status(200).jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: 'get vote scenicSpot’s users failed!'
                });
            }
            if (!scenicSpot) {
                return res.status(200).jsonp(statusCode.SCENIC_SPOT_NOT_EXIST);
            }
            else {
                var length = scenicSpot.voteUser.length;
                if (pageNumber === 0) {
                    if ((scenicSpot.voteUser.length - (pageNumber + 1) * pageSize) >= 0) {
                        scenicSpot.voteUser.splice(pageSize, scenicSpot.voteUser.length);
                    }
                } else {
                    if ((scenicSpot.voteUser.length - (pageNumber + 1) * pageSize) >= 0) {
                        scenicSpot.voteUser.splice(pageSize * (pageNumber + 1), scenicSpot.voteUser.like.length);
                        scenicSpot.voteUser.splice(0, pageNumber * pageSize);
                    } else {
                        scenicSpot.voteUser.splice(0, pageNumber * pageSize);
                    }
                }
                return res.jsonp({
                    statusCode: statusCode.SUCCESS.statusCode,
                    total: length,
                    users: scenicSpot.voteUser
                });
            }
        });
};
/**
 *查看未审核的景点列表
 */
exports.getCheckedTypeList = function (req, res) {
    if (req.query.checkedType !== 'unchecked' && req.query.checkedType !== 'deny' && req.query.checkedType !== 'pass') {
        return res.status(200).jsonp(statusCode.ARGUMENT_REQUIRED);
    }

    var pageSize = req.query.pageSize ? req.query.pageSize : 10;
    var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
    ScenicSpot.find({'checked': req.query.checkedType, 'isDeleted': {$ne: true}})
        .sort({created: -1})
        .skip(pageSize * pageNumber)
        .limit(pageSize)
        .populate('city', 'name coverUrl')
        .populate('province', 'name')
        .exec(function (err, scenicSpots) {
            if (err) {
                return res.jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: errorHandler.getErrorMessage(err) + 'get unchecked list err!'
                });
            } else {
                ScenicSpot.find({
                    'checked': req.query.checkedType,
                    'isDeleted': {$ne: true}
                }).count(function (err_count, count) {
                    if (err_count) {
                        return res.status(200).jsonp({
                            statusCode: statusCode.DATABASE_ERROR.statusCode,
                            message: errorHandler.getErrorMessage(err_count)
                        });
                    } else {
                        return res.jsonp({
                            statusCode: statusCode.SUCCESS.statusCode,
                            total: count,
                            scenicSpots: scenicSpots
                        });
                    }
                });
            }
        });

};

/**
 * 对景点进行审核
 */
exports.checkScenicSpot = function (req, res) {
    if (req.body.checkedResult !== 'deny' && req.body.checkedResult !== 'pass') {
        return res.status(200).jsonp(statusCode.PARSING_ERR);
    }
    ScenicSpot.findOne({'_id': req.params.scenicSpotId, 'isDeleted': {$ne: true}})
        .populate('city', 'name')
        .populate('province', 'name')
        .exec(function (err, scenicSpot) {
            if (err) {
                return res.status(200).jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                scenicSpot.checked = req.body.checkedResult;
                scenicSpot.checkedByUser = req.user.id;
                scenicSpot.save(function (err, checkedScenicSpot) {
                    if (err) {
                        return res.status(200).jsonp({
                            statusCode: statusCode.DATABASE_ERROR.statusCode,
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else if (checkedScenicSpot.checked === 'pass') {
                        //景点审核通过，添加景点事件
                        User.findOne({'_id': checkedScenicSpot.belongToUser}).exec(function (err, user) {
                            if (err) {
                                return res.status(200).jsonp({
                                    statusCode: statusCode.USER_NOT_EXIST.statusCode,
                                    message: 'check success! get user info failed!'
                                });
                            } else {
                                return res.jsonp({
                                    statusCode: statusCode.SUCCESS.statusCode,
                                    scenicSpot: checkedScenicSpot
                                });
                            }
                        });
                    } else {
                        return res.jsonp({
                            statusCode: statusCode.SUCCESS.statusCode,
                            scenicSpot: checkedScenicSpot
                        });
                    }
                });
            }
        });
};

/**
 * 对景点点赞
 */
exports.likeScenicSpot = function (req, res) {
    req.body.voteType = 'like';
    if (!req.body.voteType) {
        return res.jsonp(statusCode.ARGUMENT_REQUIRED);
    }
    async.waterfall([
        function (cb) {
            ScenicSpot.findOne({'_id': req.params.scenicSpotId, checked: 'pass', 'isDeleted': {$ne: true}})
                .populate('belongToUser', 'blackList')
                .exec(function (err, scenicSpot) {
                    if (err) {
                        cb(err);
                    } else if (!scenicSpot) {
                        cb(statusCode.SCENIC_SPOT_NOT_EXIST);
                    } else {
                        if (scenicSpot.voteUser.indexOf(req.user._id) !== -1) {
                            cb(statusCode.ALREADY_VOTED);
                        } else if (req.user.inUserBlackList(scenicSpot.belongToUser)) {
                            cb(statusCode.ACTION_BLOCKED);
                        } else {
                            scenicSpot.voteSize++;
                            scenicSpot.voteUser.unshift(req.user._id);
                            scenicSpot.save(function (err, scenicSpot) {
                                if (err) {
                                    cb({
                                        statusCode: statusCode.DATABASE_ERROR.statusCode,
                                        message: errorHandler.getErrorMessage(err)
                                    });
                                } else {
                                    cb(null, scenicSpot);
                                }
                            });
                        }
                    }
                });
        },
        function (scenicSpot, cb) {
            var broadcastMessage = new BroadcastMessage();
            broadcastMessage.toUser = scenicSpot.belongToUser;
            broadcastMessage.toScenicSpot = scenicSpot.id;
            broadcastMessage.createdAt = Date.now();
            broadcastMessage.fromUser = req.user.id;
            broadcastMessage.originId = scenicSpot.id;
            broadcastMessage.broadcastMessageType = 'VoteScenicSpot';
            broadcastMessage.content = req.user.displayName + '对您的执行地：\"' + scenicSpot.name + '\"很喜欢！';
            broadcastMessage.save(function (err) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, scenicSpot);
                }
            });
        },
        function (scenicSpot, cb) {
            User.findOne({'_id': scenicSpot.belongToUser}).exec(function (err, receiverUser) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, receiverUser);
                }
            });
        },

    ], function (err, receiverUser) {
        if (err) {
            return res.jsonp(err);
        }
        else {

            var JType = {
                'info': {
                    'type': 'votePlan'
                }
            };
            if (!receiverUser.jpushRegistrationId) {//有些用户没有jpushAlias,预设一个。
                receiverUser.jpushRegistrationId = 'noJPushId';
            }
            client.push().setPlatform('ios')
                .setAudience(JPush.registration_id(receiverUser.jpushRegistrationId))
                //.setAudience(JPush.registration_id('061fa661afd'))
                .setNotification(JPush.ios('请戳这里，有人对你点了“想去”，嗯！', '', 1, true, JType))
                .setOptions(null, 862000, null, true, null)
                .send(function () {
                });
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode
            });
        }
    });
};
/**
 * 对景点取消点赞
 */
exports.cancelLikeScenicSpot = function (req, res) {
    ScenicSpot.findOneAndUpdate({
        '_id': req.params.scenicSpotId,
        voteUser: req.user._id,
        checked: 'pass',
        'isDeleted': {$ne: true}
    }, {
        $pull: {'voteUser': req.user._id}, $inc: {voteSize: -1}
    }).exec(function (err, scenicSpot) {
        if (err) {
            return res.jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else if (!scenicSpot) {
            return res.jsonp(statusCode.SCENIC_SPOT_NOT_EXIST);
        }
        else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode
            });
        }
    });
};

/**
 *  根据景点列表随机返回其中的一张图片。
 * @param scenicArray 景点id的数组
 * @param cb 返回结果的回调（err,pictures）
 */
exports.getRandomPictures = function (scenicArray, cb) {
    ScenicSpot.find({_id: {$in: scenicArray}}, {album: 1})
        .exec(function (err, scenicSpots) {
            if (err) {
                return cb({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: errorHandler.getErrorMessage(err)
                });
            }
            var alternativePictures = [];
            for (var scenicIndex in scenicSpots) {
                alternativePictures = alternativePictures.concat(scenicSpots[scenicIndex].album);
            }
            return cb(null, alternativePictures);
        });
};

/**
 * Scenic spot middleware
 */
exports.scenicSpotByID = function (req, res, next, id) {
    ScenicSpot.findOne({
        _id: id,
        isDeleted: {$ne: true}
    }).exec(function (err, scenicSpot) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        }
        if (!scenicSpot) {
            return res.jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: 'The scenicspot does not exist!'
            });
        }
        req.scenicSpot = scenicSpot;
        next();
    });
};
