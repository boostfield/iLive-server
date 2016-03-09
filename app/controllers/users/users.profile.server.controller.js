'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    errorHandler = require('../errors.server.controller.js'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    async = require('async'),
    statusCode = require('../../utils/status-code');


/**
 * 更新用户信息。
 */
exports.update = function (req, res) {
    var user = req.user;

    //删除body体中的敏感信息和不可修改的信息。
    delete req.body.roles;
    delete req.body.username;
    delete req.body.password;

    var updatedKeys = req.body;
    // Merge existing user
    user = _.extend(user, req.body);
    user.updated = Date.now();
    user.save(function (err) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.UPDATE_INFO_FAILED.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var updatedFields = {};
            for (var key in updatedKeys) {
                updatedFields[key] = user[key];
            }
            res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                updatedFields: updatedFields
            });
        }
    });
};

/**
 * 获取我的个人信息。
 */
exports.me = function (req, res) {
    return res.json({
        statusCode: statusCode.SUCCESS.statusCode,
        user: req.user
    });
};
/**
 * 获取指定用户的个人信息。
 * @param req
 * @param res
 */
exports.getUserInfo = function (req, res) {
    User.findById(req.params.userId, {
        displayName: 1,
        avatarUrl: 1,
        gender: 1,
        bonusPoint: 1
    }).exec(function (err, user) {
        if (err) {
            return res.jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        } else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                user: user
            });
        }
    });
};


exports.list = function (req, res) {
    var queryObject = {isDeleted: {$ne: true}};
    if (req.query.role) {
        queryObject.roles = req.query.role;
    }

    async.parallel({
        total: function (callback) {
            User.count(queryObject, function (err, count) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, count);
                }
            });
        },
        users: function (callback) {
            var pageSize = req.query.pageSize ? req.query.pageSize : 10;
            var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;

            User.find(queryObject, {displayName: 1, avatarUrl: 1, gender: 1})
                .skip(pageSize * pageNumber)
                .limit(pageSize)
                .exec(function (err, users) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, users);
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
                users: result.users
            });
        }
    });
};

exports.getUsersBriefInfoByUsernames = function (req, res) {
    var usernames = [];

    if (!req.body.usernames || !(req.body.usernames instanceof Array)) {
        return res.status(200).jsonp({
            statusCode: statusCode.PARSING_ERR.statusCode,
            message: statusCode.PARSING_ERR.message
        });
    }
    for (var index in req.body.usernames) {
        usernames.push(req.body.usernames[index].username);

    }
    User.find({username: {$in: usernames}}, {
        username: 1,
        avatarUrl: 1,
        displayName: 1,
        gender: 1
    }, function (err, users) {

        //对返回结果进行排序，以匹配请求中的顺序。
        var sortedUser = [];
        for (var i = 0; i < usernames.length; i++) {
            for (var j = 0; j < users.length; j++) {
                if (usernames[i] === users[j].username) {
                    sortedUser[i] = users[j];
                    break;
                }
            }
        }
        return res.jsonp({
            statusCode: statusCode.SUCCESS.statusCode,
            users: sortedUser,
            total: sortedUser.length
        });
    });
};

exports.getUserInfoByUsername = function (req, res) {
    User.findOne({username: req.params.username}, {
        avatarUrl: 1,
        gender: 1,
        displayName: 1,
        username: 1
    }).exec(function (err, user) {
        if (err) {
            return res.status(200).send({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.json({
                statusCode: statusCode.SUCCESS.statusCode,
                user: user
            });
        }
    });
};

/**
 * 根据用户昵称中搜索用户。
 * @param req
 * @param res
 * @returns {*}
 */
exports.search = function (req, res) {
    if (req.query.keyword === undefined) {
        return res.status(200).send(statusCode.ARGUMENT_REQUIRED);
    }
    var queryObject = {isDeleted: {$ne: true}};

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
        queryObject.displayName = queryReg;
    }
    async.parallel({
        total: function (callback) {
            User.count(queryObject, function (err, count) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, count);
                }
            });
        },
        users: function (callback) {
            var pageSize = req.query.pageSize ? req.query.pageSize : 10;
            var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
            User.find(queryObject, {
                avatarUrl: 1,
                gender: 1,
                displayName: 1
            }).skip(pageSize * pageNumber)
                .limit(pageSize)
                .exec(function (err, users) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, users);
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
                users: result.users
            });
        }
    });
};
