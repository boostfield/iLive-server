'use strict';
var qiniu = require('qiniu'),
    config = require('../../config/config'),
    statusCode = require('../utils/status-code'),
    errorHandler = require('./errors.server.controller'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Banner = mongoose.model('Banner'),
    async = require('async');

exports.getAvatarUploadToken = function (req, res) {
    var uploadPolicy = new qiniu.rs.PutPolicy(config.qiniu.publicBucketName,
        config.qiniu.callbackUrl, config.qiniu.userCallbackBody);
    uploadPolicy.deadline = Date.parse(new Date()) % 1000 + config.qiniu.expireSpan * 24 * 3600;
    res.jsonp({
        statusCode: statusCode.SUCCESS.statusCode,
        uploadToken: uploadPolicy.token()
    });
};

exports.getBannerUploadToken = function (req, res) {
    var uploadPolicy = new qiniu.rs.PutPolicy(config.qiniu.publicBucketName, config.qiniu.bannerCallbackUrl, config.qiniu.bannerCallbackBody);
    uploadPolicy.deadline = Date.parse(new Date()) % 1000 + config.qiniu.expireSpan * 24 * 3600;
    res.jsonp({
        statusCode: statusCode.SUCCESS.statusCode,
        uptoken: uploadPolicy.token()
    });
};

exports.saveUserUploadImage = function (req, res) {
    var userId = req.body.id;
    var avatarUrl = config.qiniu.publicBucketUrl + '/' + req.body.key;
    User.findByIdAndUpdate({_id: userId}, {$set: {avatarUrl: avatarUrl}}, function (err) {
        if (!err) {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                path: avatarUrl
            });
        } else {
            return res.jsonp({
                statusCode: statusCode.UPLOAD_AVATAR_FAILED.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        }
    });
};

exports.addBannerPicture = function (req, res) {
    var bannerId = req.body.bannerId;
    var bannerUrl = config.qiniu.publicBucketUrl + '/' + req.body.key;
    Banner.findOneAndUpdate({_id: bannerId}, {'coverUrl': bannerUrl}, function (err) {
        if (!err) {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                key: req.body.key,
                hash: req.body.hash,
                type: 'banner'
            });
        } else {
            return res.jsonp({
                statusCode: statusCode.UPLOAD_IMAGE_FAILED.statusCode,
                key: req.body.key,
                hash: req.body.hash,
                message: errorHandler.getErrorMessage(err)
            });
        }
    });
};