'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    UserFeedback = mongoose.model('UserFeedback'),
    statusCode = require('../utils/status-code'),
    async = require('async'),
    _ = require('lodash');

/**
 * Create a User feedback
 */
exports.create = function (req, res) {
    if(!req.body.content){
        req.status(200).jsonp(statusCode.CONTENT_REQUIRED);
    }
    var userFeedback = new UserFeedback(req.body);
    userFeedback.user = req.user;

    userFeedback.save(function (err) {
        if (err) {
            return res.status(200).send({
                statusCode:statusCode.DATABASE_ERROR,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(statusCode.SUCCESS);
        }
    });
};

/**
 * Show the current User feedback
 */
exports.read = function (req, res) {
    res.jsonp(req.userFeedback);
};

/**
 * Update a User feedback
 */
exports.update = function (req, res) {
    var userFeedback = req.userFeedback;

    userFeedback = _.extend(userFeedback, req.body);

    userFeedback.save(function (err) {
        if (err) {
            return res.status(200).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                statusCode:statusCode.SUCCESS.statusCode,
                userFeedBack:userFeedback
            });
        }
    });
};

/**
 * Delete an User feedback
 */
exports.delete = function (req, res) {
    var userFeedback = req.userFeedback;

    userFeedback.remove(function (err) {
        if (err) {
            return res.status(200).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(userFeedback);
        }
    });
};

/**
 * List of User feedbacks
 */
exports.list = function (req, res) {
    var queryObject = {isDeleted: {$ne: true}};
    if(req.query.checked==='true'){
        queryObject = {
            isDeleted:{$ne:true},
            checked:true
        };
    }
    if(req.query.checked==='false'){
        queryObject = {
            isDeleted:{$ne:true},
            checked:false
        };
    }
    async.parallel({
        total: function (callback) {
            UserFeedback.count(queryObject, function (err, count) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, count);
                }
            });
        },
        userFeedbacks: function (callback) {
            var pageSize = req.query.pageSize ? req.query.pageSize : 10;
            var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
            UserFeedback.find(queryObject).sort('-created').populate('user', 'displayName phoneNumber email')
                .populate('handler', 'displayName phoneNumber email')
                .skip(pageSize * pageNumber)
                .limit(pageSize)
                .exec(function (err, userFeedbacks) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, userFeedbacks);
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
                userFeedbacks: result.userFeedbacks
            });
        }
    });
};

/**
 * User feedback middleware
 */
exports.userFeedbackByID = function (req, res, next, id) {
    UserFeedback.findById(id)
        .populate('user', 'displayName phoneNumber email')
        .populate('handler', 'displayName phoneNumber email')
        .exec(function (err, userFeedback) {
        if (err) return next(err);
        if (!userFeedback) return next(new Error('Failed to load User feedback ' + id));
        req.userFeedback = userFeedback;
        next();
    });
};

/**
 * User feedback authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    if (req.userFeedback.user.id !== req.user.id) {
        return res.status(403).send('User is not authorized');
    }
    next();
};
