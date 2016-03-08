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
    statusCode = require('../../utils/status-code'),
    request = require('request'),
    tokenHelper = require('../../utils/token-helper');

/**
 * Require login routing middleware
 */
exports.requiresLogin = function (req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(200).jsonp({
            statusCode: statusCode.LOGIN_REQUIRED.statusCode,
            message: statusCode.LOGIN_REQUIRED.message
        });
    }
    next();
};

/**
 * 检验Token的有效性，并根据token获取用户信息，供后续的请求使用。
 */
exports.authToken = function (req, res, next) {
    var token = (req.body && req.body.accessToken) ||
        (req.query && req.query.accessToken) || req.get('accessToken');
    if (!token) {
        return next();
    }
    try {
        var decoded = tokenHelper.decodeToken(token);
        //检验token是否过期，并检验解析出得时间戳类型是否为number
        if (((typeof decoded.exp) !== 'number') || (decoded.exp <= Date.now())) {
            return res.status(200).jsonp(statusCode.TOKEN_EXPIRED);
        }
        User.findOne({accessToken: token}, {
            displayName: 1,
            username: 1,
            roles: 1,
            gender: 1,
            phoneNumber: 1,
            avatarUrl: 1,
            birthday: 1
        })
            .exec(function (err, user) {
                if (user) {
                    req.user = user;
                    req.accessToken = token;
                    next();
                } else {
                    return res.status(200).jsonp(statusCode.INVALID_TOKEN);
                }
            });
    } catch (err) {
        return res.status(200).jsonp(statusCode.INVALID_TOKEN);
    }
};
/**
 * 获取token的剩余有效时间（单位：ms）
 */
exports.getTokenExpiredTime = function (req, res) {
    var expireTime = tokenHelper.decodeToken(req.accessToken).exp;
    var expireAfter = expireTime - Date.now();
    return res.jsonp({
        statusCode: statusCode.SUCCESS.statusCode,
        expireAfter: expireAfter
    });
};
/**
 * 集成环信做用户迁移时所调用的接口，将所有未注册至环信的用户注册至环信。
 */
exports.refreshEaseMobAccount = function (req, res) {
    User.find(function (err, users) {
        var count = 0;
        async.whilst(function () {
                return count < users.length;
            },
            function (callback) {
                var requestBody = {
                    username: users[count].username,
                    password: users[count].username
                };
                request('https://' + config.easemod.signUpUrl + '/' +
                    config.easemod.org + '/' + config.easemod.appName + '/users',
                    {
                        json: true,
                        method: 'POST',
                        body: requestBody
                    },
                    function (err, response, body) {
                        count++;
                        //满足环信每分钟最多注册30个用户的限制。
                        setTimeout(callback, 3000);
                    });
            }, function (err) {
                if (err) {
                    return res.jsonp('error happend.');
                } else {
                    return res.jsonp({
                        statusCode: statusCode.SUCCESS.statusCode,
                        message: 'refresh success!'
                    });
                }
            });
    });
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
            return res.status(200).jsonp(statusCode.TOKEN_REQUIRED);
        }
        if (_.intersection(req.user.roles, roles).length) {
            return next();
        } else {
            return res.status(200).jsonp(statusCode.NOT_AUTHORIZED);
        }
    };
};
