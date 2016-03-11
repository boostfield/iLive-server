'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    config = require('../../config/config'),
    statusCode = require('../utils/status-code'),
    ObjectionReport = mongoose.model('ObjectionReport'),
    async = require('async'),
    _ = require('lodash');

/**
 * Create a Objection report
 */
exports.create = function (req, res) {
    //举报参数合法性判断
    if (!req.params.userId && !req.body.contentId) {
        return res.status(200).jsonp(statusCode.ARGUMENT_REQUIRED);
    }

    var objectionReport = new ObjectionReport();
    objectionReport.reporter = req.user;
    objectionReport.reportType = req.body.reportType;
    objectionReport.desc = req.body.desc;
    objectionReport.chargedUser = req.params.userId;
    objectionReport.save(function (err) {
            if (err) {
                return res.status(200).send({
                    statusCode: statusCode.PARSING_ERR.statusCode,
                    message: errorHandler.getErrorMessage(err)
                });
            }
            else {
                return res.jsonp(statusCode.SUCCESS);
            }
        }
    );
};

/**
 * Show the current Objection report
 */
exports.read = function (req, res) {
    res.jsonp(req.objectionReport);
};

/**
 * Update a Objection report
 */
exports.update = function (req, res) {
    var objectionReport = req.objectionReport;

    objectionReport = _.extend(objectionReport, req.body);

    objectionReport.save(function (err) {
        if (err) {
            return res.status(200).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(objectionReport);
        }
    });
};

/**
 * Delete an Objection report
 */
exports.delete = function (req, res) {
    var objectionReport = req.objectionReport;

    objectionReport.remove(function (err) {
        if (err) {
            return res.status(200).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(objectionReport);
        }
    });
};

/**
 * List of Objection reports
 */
exports.list = function (req, res) {
    async.parallel({
        total: function (callback) {
            ObjectionReport.count({handled: 'unhandled'}, function (err, count) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, count);
                }
            });
        },
        objectionReports: function (callback) {
            var pageSize = req.query.pageSize ? req.query.pageSize : 10;
            var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
            ObjectionReport.find({handled: 'unhandled'})
                .populate('reporter', 'displayName')
                .populate('chargedUser', 'displayName')
                .skip(pageSize * pageNumber)
                .limit(pageSize)
                .exec(function (err, objectionReports) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, objectionReports);
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
                objectionReports: result.objectionReports
            });
        }
    });
};

/**
 * Objection report middleware
 */
exports.objectionReportByID = function (req, res, next, id) {
    ObjectionReport.findById(id).populate('user', 'displayName').exec(function (err, objectionReport) {
        if (err) return next(err);
        if (!objectionReport) return next(new Error('Failed to load Objection report ' + id));
        req.objectionReport = objectionReport;
        next();
    });
};

/**
 * Objection report authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    if (req.objectionReport.user.id !== req.user.id) {
        return res.status(403).send('User is not authorized');
    }
    next();
};
