'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    config = require('../../config/config'),
    statusCode = require('../utils/status-code'),
    User = mongoose.model('User'),
    LivingRoom = mongoose.model('LivingRoom'),
    LivingRecord = mongoose.model('LivingRecord'),
    async = require('async'),
    _ = require('lodash');


function hasLivingPermission(user) {
    if (user.lockExpired > new Date()) {
        return false;
    } else {
        return true;
    }
}
exports.startLiving = function (req, res) {
    if (!req.body.chatRoomId) {
        return res.status(200).jsonp(statusCode.ARGUMENT_REQUIRED);
    }

    var user = req.user;
    if (!hasLivingPermission(user)) {
        return res.status(200).jsonp(statusCode.USER_LOCKED);
    }
    async.waterfall([
        function (cb) {
            LivingRoom.count({hostId: user.id}, function (err, count) {
                if (err) {
                    return cb({
                        statusCode: statusCode.DATABASE_ERROR.statusCode,
                        message: errorHandler.getErrorMessage(err)
                    });
                } else if (count >= 1) {
                    cb(statusCode.LIVING_IS_ON);
                } else {
                    cb(null);
                }
            })
        },
        function (cb) {
            var livingRoom = new LivingRoom({
                hostId: user.id,
                livingRoomName: req.body.livingRoomName,
                livingRoomId: user.livingRoomId,
                chatRoomId: req.body.chatRoomId
            });
            livingRoom.save(function (err, livingRoom) {
                if (err) {
                    return cb({
                        statusCode: statusCode.DATABASE_ERROR.statusCode,
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    cb(null, livingRoom);
                }
            });
        }], function (err, livingRoom) {
        if (err) {
            return res.jsonp(err);
        } else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                livingRoom: livingRoom
            });
        }
    });
};

exports.stopLiving = function (req, res) {
    var user = req.user;
    user.livingRoomStatus = false;
    user.save(function (err) {
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

exports.livingRoomList = function (req, res) {
    var queryObject = {isDeleted: {$ne: true}};
    queryObject.livingRoomStatus = true;

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
            var pageSize = req.query.pageSize ? req.query.pageSize : 999999;
            var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;

            User.find(queryObject, {displayName: 1, avatarUrl: 1, gender: 1, chatRoomId: 1, livingRoomId: 1})
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
