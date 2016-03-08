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
    if (!req.isAuthenticated()) {
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
