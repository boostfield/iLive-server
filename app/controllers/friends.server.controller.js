'use strict';

/**
 * Module dependencies.
 */
var JPush = require('jpush-sdk'),
    config = require('../.././config/config'),
    client = JPush.buildClient(config.jpush.appkey, config.jpush.secret),
    mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    User = mongoose.model('User'),
    _ = require('lodash'),
    async = require('async'),
    statusCode = require('../utils/status-code');

/**
 * 查看好友列表。好友列表支持分页
 */
exports.getFriendList = function (req, res) {//查看好友列表
    var pageSize = parseInt(req.query.pageSize) ? parseInt(req.query.pageSize) : 10;
    var pageNumber = parseInt(req.query.pageNumber) ? parseInt(req.query.pageNumber) : 0;
    User.findOne({'_id': req.user._id})
        .populate([
            {
                path: 'friends.user',
                select: {
                    _id: 1,
                    'displayName': 1,
                    'avatarUrl': 1,
                    'username': 1,
                    'gender': 1
                }
            }])
        .exec(function (err, u) {
            if (err) {
                var databaseErr = statusCode.DATABASE_ERROR;
                databaseErr.message = errorHandler.getErrorMessage(err);
                return res.jsonp({
                    statusCode: databaseErr.statusCode,
                    message: databaseErr.statusCode
                });
            } else {
                var length = u.friends.length;
                if (pageNumber === 0) {
                    if ((u.friends.length - (pageNumber + 1) * pageSize) >= 0) {
                        u.friends.splice(pageSize, u.friends.length);
                    }
                } else {
                    if ((u.friends.length - (pageNumber + 1) * pageSize) >= 0) {
                        u.friends.splice(pageSize * (pageNumber + 1), u.friends.length);
                        u.friends.splice(0, pageNumber * pageSize);
                    } else {
                        u.friends.splice(0, pageNumber * pageSize);
                    }
                }

                var friends = JSON.parse(JSON.stringify(u.friends));
                var friendListSize = 0;
                async.whilst(function () {
                        return friendListSize < friends.length;
                    }, function (callbackSpot) {
                        friends[friendListSize].id = friends[friendListSize].user._id ? friends[friendListSize].user._id : friends[friendListSize].user.id;
                        friends[friendListSize].displayName = friends[friendListSize].user.displayName;
                        friends[friendListSize].username = friends[friendListSize].user.username;
                        friends[friendListSize].gender = friends[friendListSize].user.gender;
                        delete friends[friendListSize].user;
                        delete friends[friendListSize]._id;
                        friends[friendListSize].avatarUrl = u.friends[friendListSize].user.avatarUrl;
                        friendListSize++;
                        callbackSpot();
                    },
                    function (err) {
                        if (err) {
                            return res.jsonp({
                                statusCode: statusCode.DATABASE_ERROR.statusCode,
                                message: 'getFriend List error!'
                            });
                        }
                        res.jsonp({
                            statusCode: statusCode.SUCCESS.statusCode,
                            total: length,
                            friends: friends
                        });
                    }
                );


            }
        });

};
/**
 * 查看好友详情
 */
exports.getFriend = function (req, res) {//查看好友详情
    User.findOne({'_id': req.params.userId}, {'gender': 1}, function (err, user) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                friend: user
            });

        }
    });
};
/**
 * 删除好友
 * @param req
 * @param res
 */
exports.deleteFriend = function (req, res) {//删除好友
    async.waterfall([
            function (cb) {
                User.update({'_id': req.user._id}, {$pull: {'friends': {'user': req.params.userId}}}, {
                    safe: false,
                    multi: true
                }, function (err) {
                    if (err) {
                        var databaseErr = statusCode.DATABASE_ERROR;
                        databaseErr.message = errorHandler.getErrorMessage(err);
                        cb(databaseErr);
                    } else {
                        cb(null);
                    }
                });
            },
            function (cb) {
                User.update({'_id': req.params.userId}, {$pull: {'friends': {'user': req.user._id}}}, {
                    safe: false,
                    multi: true
                }, function (err) {
                    if (err) {
                        var databaseErr = statusCode.DATABASE_ERROR;
                        databaseErr.message = errorHandler.getErrorMessage(err);
                        cb(databaseErr);
                    } else {
                        res.jsonp({
                            statusCode: statusCode.SUCCESS.statusCode
                        });
                    }
                });
            }],
        function (err) {
            res.status(200).jsonp(err);
        });

};

/**
 * 1.手机端默认为：两人聊天一定次数以上，自动加好友
 * 2.双向添加好友
 */
exports.addFriend = function (req, res) {
    if (!req.body.touser || !req.body.toUser.username) {
        return res.status(200).jsonp(statusCode.ARGUMENT_REQUIRED);
    }
    User.findOne({'username': req.body.toUser.username}).exec(function (err, user) {
        if (err || !user) {
            return res.jsonp({
                statusCode: statusCode.USER_NOT_EXIST.statusCode,
                message: 'The user with username ' + req.body.toUser.username + ' does not exist.'
            });
        }
        else {
            req.body.toUser.id = user.id;
            req.body.toUser.avatarUrl = user.avatarUrl;
            req.body.toUser.displayName = user.displayName;
            async.waterfall([
                    function (cb) {//双向添加好友1
                        User.findOne({
                            '_id': req.user.id,
                            'friends.user': req.body.toUser.id
                        }).exec(function (err, user) {
                            if (err) {
                                cb(statusCode.DATABASE_ERROR);
                            }
                            if (user !== null) {
                                cb(null);
                            }
                            if (!user) {
                                var friend = {
                                    'user': req.body.toUser.id,
                                    'avatarUrl': req.body.toUser.avatarUrl,
                                    'displayName': req.body.toUser.displayName
                                };
                                User.update({'_id': req.user.id}, {
                                    $addToSet: {
                                        'friends': friend
                                    }
                                }, function (err) {
                                    if (err) {
                                        var databaseErr1 = statusCode.ACCEPT_FRIENDREQUEST_UPDATE_USER1_ERR.statusCode;
                                        databaseErr1.message = errorHandler.getErrorMessage(err);
                                        cb(databaseErr1);
                                    } else {
                                        cb(null);
                                    }
                                });
                            }
                        });
                    },
                    function (cb) {//双向添加好友2
                        User.findOne({
                            '_id': req.body.toUser.id,
                            'friends.user': req.user.id
                        }).exec(function (err, user) {
                            if (err) {
                                cb(statusCode.DATABASE_ERROR);
                            }
                            if (user !== null) {
                                cb(statusCode.FRIEND_EXIST);
                            }
                            if (user === null) {
                                var friend = {
                                    'user': req.user.id,
                                    'avatarUrl': req.user.avatarUrl,
                                    'displayName': req.user.displayName
                                };
                                User.update({'_id': req.body.toUser.id}, {
                                    $addToSet: {
                                        'friends': friend
                                    }
                                }, function (err) {
                                    if (err) {
                                        var databaseErr1 = statusCode.ACCEPT_FRIENDREQUEST_UPDATE_USER1_ERR.statusCode;
                                        databaseErr1.message = errorHandler.getErrorMessage(err);
                                        cb(databaseErr1);
                                    } else {
                                        return res.jsonp({
                                            statusCode: statusCode.SUCCESS.statusCode
                                        });
                                    }
                                });
                            }
                        });
                    }],
                function (err) {
                    return res.status(200).jsonp(err);
                });
        }
    });
};

exports.addToBlackList = function (req, res) {
    User.findByIdAndUpdate(req.user.id, {$addToSet: {blackList: req.params.userId}}, function (err) {
        if (err) {
            return res.jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.jsonp(statusCode.SUCCESS);
        }
    });
};


exports.removeFromBlackList = function (req, res) {
    User.findByIdAndUpdate(req.user.id, {$pull: {blackList: req.params.userId}}, function (err) {
        if (err) {
            return res.jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.jsonp(statusCode.SUCCESS);
        }
    });
};


