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
    if (!hasLivingPermission(user)) {
        return res.status(200).jsonp(statusCode.USER_LOCKED);
    }

    async.waterfall([
        //查看所要关闭的直播间是否存在
        function (cb) {
            LivingRoom.findOne({hostId: user.id}, function (err, livingRoom) {
                if (err) {
                    return cb({
                        statusCode: statusCode.DATABASE_ERROR.statusCode,
                        message: errorHandler.getErrorMessage(err)
                    });
                } else if (!livingRoom) {
                    cb(statusCode.LIVING_IS_OFF);
                } else {
                    cb(null, livingRoom);
                }
            })
        },
        //整理直播信息并归档至livingRecord
        function (livingRoom, cb) {
            var livingRecord = new LivingRecord({
                hostId: livingRoom.hostId,
                livingRoomName: livingRoom.livingRoomName,
                livingRoomId: user.livingRoomId,
                startTime: livingRoom.startTime,
                voteTimes: livingRoom.voteTimes,
                watchTimes: livingRoom.watchTimes,
                giftValue: livingRoom.giftValue
            });
            livingRecord.endTime = new Date();
            livingRecord.lastPeriod = livingRecord.endTime - livingRecord.startTime;
            livingRecord.save(function (err, livingRecord) {
                if (err) {
                    cb({
                        statusCode: statusCode.DATABASE_ERROR.statusCode,
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    cb(null, livingRecord, livingRoom.id);
                }
            });
        },
        //删除当前直播信息
        function (livingRecord, livingRoomId, cb) {
            LivingRoom.remove({_id: livingRoomId}, function (err) {
                if (err) {
                    cb({
                        statusCode: statusCode.DATABASE_ERROR.statusCode,
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    cb(null, livingRecord)
                }
            })
        }
    ], function (err, livingRecord) {
        if (err) {
            return res.jsonp(err);
        } else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                livingRecord: livingRecord
            });
        }
    });
};

exports.livingRoomList = function (req, res) {
    async.parallel({
        total: function (callback) {
            LivingRoom.count(function (err, count) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, count);
                }
            });
        },
        livingRooms: function (callback) {
            var pageSize = req.query.pageSize ? req.query.pageSize : 999999;
            var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;

            LivingRoom.find()
                .populate('hostId', 'displayName avatarUrl')
                .skip(pageSize * pageNumber)
                .limit(pageSize)
                .exec(function (err, livingRooms) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, livingRooms);
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
                livingRooms: result.livingRooms
            });
        }
    });
};
