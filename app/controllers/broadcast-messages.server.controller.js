'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    config = require('../../config/config'),
    async = require('async'),
    errorHandler = require('./errors.server.controller'),
    BroadcastMessage = mongoose.model('BroadcastMessage'),
    User = mongoose.model('User'),
    _ = require('lodash'),
    statusCode = require('../utils/status-code'),
    JPush = require('jpush-sdk'),
    client = JPush.buildClient(config.jpush.appkey, config.jpush.secret);


var pushNotification = function (tag, alias, registrationId, content, extra) {
    var IsProductionFlag = false;
    if (process.env.NODE_ENV === 'production') {
        IsProductionFlag = true;
    }
    if (tag) {
        client.push().setPlatform(JPush.ALL)
            .setAudience(JPush.tag(tag))
            .setNotification('玩鲜通知',
            JPush.ios(content, '', 1, false, extra),
            JPush.android(content, null, 1, extra))
            .setMessage(content)
            .setOptions(null, 60, null, IsProductionFlag, null)
            .send(function (err, res) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(res);
                }
            });
    } else if (registrationId) {
        client.push().setPlatform(JPush.ALL)
            .setAudience(JPush.registration_id(registrationId))
            .setNotification('玩鲜通知',
            JPush.ios(content, '', 1, false, extra),
            JPush.android(content, null, 1, extra))
            .setMessage(content)
            .setOptions(null, 60, null, IsProductionFlag, null)
            .send(function (err, res) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(res);
                }
            });
    }
};
/**
 *
 * @param 要创建消息的用户群
 * @param 要推送消息的标签
 * @param 熬创建消息的单个用户
 * @param 消息类型
 * @param 消息对应的资源Id
 * @param 消息的内容
 * @param 是否需要推送
 * @param 资源的动作
 * @param callback
 */
exports.createMessage = function (userGroup, tag, singleUser, sourceType, sourceId, resourceName, message, needPushNotification, action, callback) {
    var broadcast = new BroadcastMessage();
    if (userGroup) {
        for (var index = 0; index < userGroup.length; index++) {
            broadcast.to
                .push({
                    user: userGroup[index],
                    read: false
                });
        }
    }
    if (singleUser) {
        broadcast.to.push({
            user: singleUser,
            read: false
        });
    }
    broadcast.type = sourceType;
    broadcast.originId = sourceId;
    broadcast.content = message;
    if (needPushNotification) {
        var extra = {
            info: {
                type: sourceType,
                originId: sourceId,
                action: action,
                resourceName: resourceName
            }
        };
        if (singleUser) {
            User.findById(singleUser, {
                jpushRegistrationId: 1
            }).exec(function (err, user) {
                pushNotification(null, null, user.jpushRegistrationId, message, extra);
            });
        } else {
            pushNotification(broadcast.originId.toString(), null, null, message, extra);
        }
    }
    broadcast.save(function (err) {
        if (err) {
            callback({
                statusCode: statusCode.DATABASE_ERROR,
                message: err.message
            });
        } else {
            callback(null, statusCode.SUCCESS);
        }
    });
};


exports.setRead = function (req, res) {
    BroadcastMessage.findOneAndUpdate({_id: req.params.broadcastMessageId, 'to.user': req.user._id}, {
        $set: {
            'to.$.read': true
        }
    }, function (err) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.message,
                message: err.message
            });
        } else {
            return res.jsonp(statusCode.SUCCESS);
        }
    });
};

exports.getUnReadCount = function (req, res) {
    BroadcastMessage.count({
        'to.user': req.user.id,
        'to.read': {$ne: true},
        'isDeleted': {$ne: true}
    }, function (err, count) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        } else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                count: count
            });
        }
    });
};

exports.getMessageList = function (req, res) {
    var queryObject = {
        'to.user': req.user._id
    };
    if (req.query.read === 'true') {
        queryObject['to.read'] = true;
    }
    if (req.read === 'false') {
        queryObject['to.read'] = false;
    }
    async.parallel({
        total: function (callback) {
            BroadcastMessage.count(queryObject, function (err, count) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, count);
                }
            });
        },
        messages: function (callback) {
            var pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
            var pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 0;
            BroadcastMessage.aggregate(
                {$unwind: '$to'},
                {$match: queryObject},
                {
                    $project: {
                        id: '$_id',
                        _id: 0,
                        content: 1,
                        originId: 1,
                        type: 1,
                        createdAt: 1,
                        read: '$to.read'
                    }
                },
                {$sort: {createdAt: -1}}
            )
                .skip(pageSize * pageNumber)
                .limit(pageSize)
                .exec(function (err, messages) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, messages);
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
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                total: result.total,
                message: result.messages
            });
        }
    });
};

