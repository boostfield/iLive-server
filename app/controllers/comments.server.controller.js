'use strict';

/**
 * Module dependencies.
 */
var JPush = require('jpush-sdk'),
    config = require('../../config/config'),
    client = JPush.buildClient(config.jpush.appkey, config.jpush.secret),
    mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    User = mongoose.model('User'),
    BroadcastMessage = mongoose.model('BroadcastMessage'),
    Comment = mongoose.model('Comment'),
    TaskList = mongoose.model('TaskList'),
    Task = mongoose.model('Task'),
    _ = require('lodash'),
    async = require('async'),
    statusCode = require('../utils/status-code'),
    ScenicSpot = mongoose.model('ScenicSpot'),
    Picture = mongoose.model('Picture');

var getCommentList = function (sourceType, sourceId, pageNumber, pageSize, callback) {
    var queryObject = {isDeleted: {$ne: true}};
    queryObject.originId = sourceId;
    async.parallel({
        total: function (cb) {
            Comment.count(queryObject, function (err, count) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, count);
                }
            });
        },
        comments: function (cb) {

            Comment.find(queryObject, {
                originId: 1,
                commentType: 1,
                fromUser: 1,
                toUser: 1,
                toComment: 1,
                content: 1,
                createdAt: 1
            })
                .populate('fromUser', 'displayName avatarUrl')
                .populate('toUser', 'displayName avatarUrl')
                .populate('toComment', 'content')
                .skip(pageSize * pageNumber)
                .limit(pageSize)
                .sort({createdAt: -1})
                .exec(function (err, comments) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, comments);
                    }
                });
        }
    }, function (err, result) {
        if (err) {
            callback(statusCode.DATABASE_ERROR);
        } else {
            callback(null, {
                statusCode: statusCode.SUCCESS.statusCode,
                total: result.total,
                comments: result.comments
            });
        }
    });
};

exports.getTaskComments = function (req, res) {
    var pageSize = req.query.pageSize ? req.query.pageSize : 10;
    var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
    getCommentList('Task', req.params.taskId, pageNumber, pageSize, function (err, result) {
        if (err) {
            return res.status(200).jsonp(err);
        } else {
            return res.jsonp(result);
        }
    });
};

exports.getTaskListComments = function (req, res) {
    var pageSize = req.query.pageSize ? req.query.pageSize : 10;
    var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
    getCommentList('TaskList', req.params.taskListId, pageNumber, pageSize, function (err, result) {
        if (err) {
            return res.status(200).jsonp(err);
        } else {
            return res.jsonp(result);
        }
    });
};


var createComment = function (sourceType, sourceId, fromUser, content, replyInfo, callback) {
    var comment = new Comment();
    comment.commentType = sourceType;
    comment.content = content.trim().replace(/\s+/g,' ');
    var source = null;
    switch (comment.commentType) {
        case 'TaskList':
            source = TaskList;
            break;
        case 'Task':
            source = Task;
            break;
        default:
            return callback(statusCode.COMMENT_TYPE_NOT_FOUND);
    }
    source.findByIdAndUpdate(sourceId, {$inc: {'commentSize': 1}}).exec(function (err, updatedSource) {
        if (err) {
            callback({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            comment.fromUser = fromUser;
            if (replyInfo) {
                comment.toUser = replyInfo.toUser;
                comment.toComment = replyInfo.toComment;
            }
            comment.contentType = sourceType;
            comment['to' + sourceType] = sourceId;
            comment.originId = sourceId;
            comment.createdAt = Date.now();
            comment.save(function (err, comment) {
                if (err) {
                    callback({
                        statusCode: statusCode.DATABASE_ERROR.statusCode,
                        message: errorHandler.getErrorMessage(err)
                    });
                }
                else {
                    Comment.findById(comment.id, {
                        originId: 1,
                        toComment: 1,
                        fromUser: 1,
                        toUser: 1,
                        content: 1,
                        commentType: 1,
                        createdAt: 1
                    })
                        .populate('toComment', 'content')
                        .populate('fromUser', 'displayName avatarUrl')
                        .populate('toUser', 'displayName avatarUrl')
                        .exec(function (err, comment) {
                            callback(null, comment);
                        });
                }
            });
        }
    });
};

exports.replyComment = function (req, res) {
    if (!req.body.content) {
        return res.jsonp(statusCode.COMMENT_CONTENT_REQUIRED);
    }
    var replyInfo = {
        toComment: req.comment.id,
        toUser: req.comment.fromUser
    };
    createComment(req.comment.commentType, req.comment.originId, req.user.id, req.body.content, replyInfo, function (err, comment) {
        if (err) {
            return res.status(200).jsonp(err);
        } else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                comment: comment
            });
        }
    });


};
/**
 * 添加taskList的评论
 * @param req
 * @param res
 * @returns {*}
 */
exports.createTaskListComment = function (req, res) {
    if (!req.body.content) {
        return res.jsonp(statusCode.COMMENT_CONTENT_REQUIRED);
    }
    createComment('TaskList', req.params.taskListId, req.user.id, req.body.content, null, function (err, comment) {
        if (err) {
            return res.status(200).jsonp(err);
        } else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                comment: comment
            });
        }
    });
};

/**
 * 添加taskList的评论
 * @param req
 * @param res
 * @returns {*}
 */
exports.createTaskComment = function (req, res) {
    if (!req.body.content) {
        return res.jsonp(statusCode.COMMENT_CONTENT_REQUIRED);
    }
    createComment('Task', req.params.taskId, req.user.id, req.body.content, null, function (err, comment) {
        if (err) {
            return res.status(200).jsonp(err);
        } else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                comment: comment
            });
        }
    });
};

/**
 * 删除评论
 * @param req
 * @param res
 * @returns {*}
 */
exports.deleteComment = function (req, res) {
    if (JSON.stringify(req.comment.fromUser) !== JSON.stringify(req.user._id)) {
        return res.status(200).jsonp({
            statusCode: statusCode.NOT_AUTHORIZED.statusCode,
            message: 'it is not your comment'
        });
    } else if (req.comment.isDeleted === true) {
        return res.status(200).jsonp({
            statusCode: statusCode.NOT_AUTHORIZED.statusCode,
            message: 'comment has been deleted!'
        });
    }
    else {
        req.comment.isDeleted = true;
        req.comment.save(function (err) {
            if (err) {
                return res.status(200).jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: err.message
                });
            } else {
                var sourceType = null;
                if (req.comment.commentType === 'Task') {
                    sourceType = Task;
                } else {
                    sourceType = TaskList;
                }
                sourceType.findByIdAndUpdate(req.comment.originId, {$inc: {'commentSize': -1}}).exec(function (err, updatedSource) {
                    if (err) {
                        res.status(200).jsonp({
                            statusCode: statusCode.DATABASE_ERROR.statusCode,
                            message: errorHandler.getErrorMessage(err)
                        });
                    }
                    else {
                        res.jsonp(statusCode.SUCCESS);
                    }
                });
            }
        });
    }
};

/**
 * comments middleware
 */
exports.commentById = function (req, res, next, id) {
    Comment.findOne({'_id': id}).exec(function (err, comment) {
        if (err) {
            return next(err);
        }
        if (!comment) {
            return res.jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: 'The comment doesn\'t exist or has been deleted.'
            });
        }
        req.comment = comment;
        next();
    });
};
