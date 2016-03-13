'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    config = require('../../config/config'),
    statusCode = require('../utils/status-code'),
    async = require('async'),
    _ = require('lodash');

exports.startLiving = function (req, res) {
    if (!req.body.chatRoomId) {
        return res.status(200).jsonp(statusCode.ARGUMENT_REQUIRED);
    }

    var user = req.user;
    if (user.active === false) {
        return res.status(200).jsonp(statusCode.USER_LOCKED);
    }
    user.livingRoomStatus = true;
    user.chatRoomId = req.body.chatRoomId;
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