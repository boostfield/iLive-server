/**
 * Created by wangerbing on 15/9/22.
 */

'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),

    errorHandler = require('./errors.server.controller'),
    Task = mongoose.model('Task'),
    QuotaRecorder = mongoose.model('QuotaRecorder'),
    config = require('../../config/config'),
    statusCode = require('../utils/status-code'),
    async = require('async'),
    _ = require('lodash');


/**
 * Show the current QuotaRecorder
 */
exports.read = function (req, res) {
    res.jsonp(req.quotaRecorder);
};


/**
 *  List of QuotaRecorder
 */
exports.quotaRecorderList = function (req, res) {
    var pageSize = req.query.pageSize ? req.query.pageSize : 10;
    var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
    var queryObject = {};
    if (req.query) {
        if (req.query.result) {
            queryObject.result = req.query.result;
        }
    }
    QuotaRecorder.find(queryObject).sort('-created')
        .skip(pageSize * pageNumber)
        .limit(pageSize)
        .populate('fromTenant', 'displayName')
        .populate('fromTask', 'name')
        .populate('handler', 'displayName')
        .exec(function (err, quotaRecorders) {
            if (err) {
                return res.status(200).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                QuotaRecorder.count(queryObject, function (err, count) {
                    if (err) {
                        return res.status(200).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp({
                            statusCode: statusCode.SUCCESS.statusCode,
                            total: count,
                            quotaRecorders: quotaRecorders
                        });
                    }
                });
            }
        });
};
/**
 * QuotaRecorder middleware
 */
exports.quotaRecorderById = function (req, res, next, id) {
    QuotaRecorder.findById(id)
        .populate('fromTenant', 'displayName')
        .populate('fromTask', 'name')
        .populate('handler', 'displayName')
        .exec(function (err, quotaRecorder) {
            if (err) return next(err);
            if (!quotaRecorder) {
                return res.status(200).jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: 'QuotaRecorder not exist !'
                });
            }
            req.quotaRecorder = quotaRecorder;
            next();
        });
};

/**
 * 商户申请配额
 */

exports.applyForQuota = function (req, res) {

    if (!req.body.quantity) {
        return res.status(200).jsonp({
            statusCode: statusCode.PARSING_ERR.statusCode,
            message: 'no  quantity!!'
        });
    }

    var newQuotaRecorder = new QuotaRecorder(
        {
            fromTenant: req.user.id,
            fromTask: req.params.taskId,
            created: Date.now(),
            quantity: req.body.quantity,
            result: 'unchecked'
        });
    newQuotaRecorder.save(function (err, quotaRecorder) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message + 'Add quota record failed!!'
            });
        } else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                QuotaRecorder: quotaRecorder

            });
        }
    });
};

/**
 * 管理员处理配额申请
 */

exports.handleRequest = function (req, res) {
    req.quotaRecorder.result = req.body.result;
    req.quotaRecorder.handler = req.user.id;
    req.quotaRecorder.handleTime = Date.now();
    if (req.body.result === 'pass') {
        Task.findOne({'_id': req.quotaRecorder.fromTask}, function (err, task) {
            if (err) {
                return res.status(200).jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: err.message + 'Add quota record failed!!'
                });
            } else {
                task.quota = task.quota + req.quotaRecorder.quantity;
                task.save(function (err) {
                    if (err) {
                        return res.status(200).jsonp({
                            statusCode: statusCode.DATABASE_ERROR.statusCode,
                            message: err.message + 'task save failed! handle quota record failed!!'
                        });
                    } else {
                        req.quotaRecorder.save(function (err) {
                            if (err) {
                                return res.status(200).jsonp({
                                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                                    message: err.message + 'handle quota record failed!!'
                                });
                            } else {
                                return res.jsonp({
                                    statusCode: statusCode.SUCCESS.statusCode
                                });
                            }
                        });
                    }
                });
            }
        });
    } else {
        if (req.body.message) {
            req.quotaRecorder.message = req.body.message;
        }
        req.quotaRecorder.save(function (err) {
            if (err) {
                return res.status(200).jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: err.message + 'task save failed! handle quota record failed!!'
                });
            } else {
                return res.jsonp({
                    statusCode: statusCode.SUCCESS.statusCode
                });
            }
        });
    }
};

/**
 * 商户验证是否有未处理的配额请求
 */
exports.authTenant = function (req, res) {
    QuotaRecorder.find({'fromTask': req.params.taskId, 'result': 'unchecked'}).exec(function (err, quotaRecorders) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        } else {
            if (quotaRecorders.length <= 0) {
                return res.jsonp({
                    statusCode: statusCode.SUCCESS.statusCode,
                    result: true
                });
            } else {
                return res.jsonp({
                    statusCode: statusCode.SUCCESS.statusCode,
                    result: false
                });
            }
        }

    });

};
