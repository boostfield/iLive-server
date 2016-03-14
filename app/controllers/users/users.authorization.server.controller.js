'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    async = require('async'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    config = require('../../../config/config'),
    errorHandler = require('../errors.server.controller'),
    statusCode = require('../../utils/status-code');

/**
 * Require login routing middleware
 */
exports.requiresLogin = function (req, res, next) {
    if (!req.user) {
        return res.status(200).jsonp(statusCode.LOGIN_REQUIRED);
    }
    next();
};

/**
 * 为用户添加权限（管理员接口），可添加权限类型见文档中的权限描述。
 * @param req
 * @param res
 */
exports.addPermission = function (req, res) {
    User.findOneAndUpdate({username: req.body.username}, {$addToSet: {roles: req.body.permission}}, function (err, user) {
        if (!user) {
            return res.status(200).jsonp(statusCode.USER_NOT_EXIST);
        } else if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                message: req.body.permission + ' permission has been added to ' + user.username
            });
        }
    });
};

/**
 * 封禁用户，仅涉及视频直播权限。
 * @param req
 * @param res
 */
exports.lockUser = function (req, res) {

    var expireDate = new Date();
    var lockType =  parseInt(req.body.lockPeriod);
    switch (lockType) {
        //case 0 永久封禁
        case 0:
            expireDate.setFullYear(expireDate.getFullYear() + 100);
            console.log(expireDate);
            break;
        //case 1 封禁1天
        case 1:
            expireDate.setDate(expireDate.getDate() + 1);
            break;
        //case 2 封禁1周
        case 2:
            expireDate.setDate(expireDate.getDate() + 7);
            break;
        //case 2 封禁1个月
        case 3:
            expireDate.setMonth(expireDate.getMonth() + 1);
            break;
        //默认封禁1天
        default:
            expireDate.setDate(expireDate.getDate() + 1);
            break;
    }

    User.findByIdAndUpdate(req.params.userId, {lockExpired: expireDate}, function (err, user) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                lockExpired: user.lockExpired
            });
        }
    });
};

exports.unlockUser = function (req, res) {
    var expireDate = new Date();
    User.findByIdAndUpdate(req.params.userId, {lockExpired: expireDate}, function (err, user) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                lockExpired: user.lockExpired
            });
        }
    });
};

/**
 * User authorizations routing middleware
 */
exports.hasAuthorization = function (roles) {
    return function (req, res, next) {
        if (roles.indexOf('visitor') !== -1) {
            return next();
        } else if (!req.user) {
            return res.status(200).jsonp(statusCode.LOGIN_REQUIRED);
        }
        if (_.intersection(req.user.roles, roles).length) {
            return next();
        } else {
            return res.status(200).jsonp(statusCode.NOT_AUTHORIZED);
        }
    };
};
