/**
 * Created by Ethan-Wu on 6/30/15.
 */
'use strict';
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Province = mongoose.model('Province'),
    City = mongoose.model('City'),
    User = mongoose.model('User'),
    qiniu = require('qiniu'),
    http = require('http'),
    async = require('async'),
    ScenicSpot = mongoose.model('ScenicSpot'),
    plist = require('plist'),
    statusCode = require('../utils/status-code'),
    config = require('../../config/config'),
    _ = require('lodash');

//为所有用户添加流连助手客服和流连用户反馈客服为好友。
exports.refreshEaseMobService = function (req, res) {

    User.find().exec(function (err, users) {
        var count = 0;
        async.whilst(
            function () {
                return count < users.length;
            },
            function (cb) {
                users[count].password = 'siyeeorg';

                users[count].save(function (err, user) {
                    if (err) {
                        cb(err);
                    } else {
                        console.log(user.friends);
                        count++;
                        cb();
                    }
                });
            },
            function (err) {
                if (err) {
                    console.log(err);
                    return res.jsonp({
                        message: err.message
                    });
                } else {
                    return res.jsonp({
                        message: 'all set!' + users.length
                    });
                }
            }
        );
    });
};

exports.refreshUserAvatarExifInfo = function (req, res) {
    User.find().exec(function (err, users) {
        var client = new qiniu.rs.Client();
        var count = 0;
        async.whilst(
            function () {
                return count < users.length;
            },
            function (cb) {
                users[count].password = 'siyeeorg';
                var newpath = '';
                if (users[count].avatarUrl.indexOf('avatar') !== -1 && users[count].avatarUrl.indexOf('jpeg') !== -1) {
                    count++;
                    cb();
                } else {
                    if (users[count].avatarUrl.indexOf('avatar') === -1) {
                        newpath = 'jpeg/avatar/' + users[count].avatarUrl;
                    } else {
                        newpath = 'jpeg/' + users[count].avatarUrl;
                    }
                    client.move(config.qiniu.testBucketName, users[count].avatarUrl, config.qiniu.testBucketName, newpath, function (err, ret) {
                        if (!err) {
                            users[count].avatarUrl = newpath;
                            users[count].save(function (err, user) {
                                if (err) {
                                    cb(err);
                                } else {
                                    count++;
                                    cb();
                                }
                            });
                        } else {
                            count++;
                            cb();
                        }
                    });
                }

            },
            function (err) {
                if (err) {
                    console.log(err);
                    return res.jsonp({
                        message: err
                    });
                } else {
                    return res.jsonp({
                        message: 'all set!' + users.length
                    });
                }
            }
        );
    });
};
