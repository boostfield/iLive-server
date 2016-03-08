'use strict';

/**
 * Module dependencies.
 */

var _ = require('lodash'),
    config = require('../../config/config'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Counter = mongoose.model('Counter'),
    PageRank = mongoose.model('PurchaseRank'),
    async = require('async'),
    statusCode = require('../utils/status-code');

function getActivityStatus(platform) {
    if (platform === 'Android' && config.activityAndroidOff) {
        return {
            statusCode: statusCode.SUCCESS.statusCode,
            activityStatus: 'End',
            result: {
                activityStatus: 'End',
                rollTime: config.activityStartDate

            }
        };
    }
    platform = platform ? platform : 'iOS';
    if (!platform || (platform === 'iOS' && config.activityiOSOff)) {
        return {
            statusCode: statusCode.SUCCESS.statusCode,
            activityStatus: 'End',
            result: {
                activityStatus: 'End',
                rollTime: config.activityStartDate

            }
        };
    }
    var activityStatus = '';
    var now = new Date();
    var timeLeft = config.activityEndDate - now;
    if (now < config.activityStartDate) {
        activityStatus = 'NotBegin';
    } else if (now < config.activityEndDate) {
        activityStatus = 'Ongoing';
    } else {
        activityStatus = 'End';
    }
    return {
        statusCode: statusCode.SUCCESS.statusCode,
        activityStatus: activityStatus,
        startDate: config.activityStartDate,
        rollTime: config.activityStartDate,
        endDate: config.activityEndDate,
        timeLeft: timeLeft,
        result: {
            activityStatus: activityStatus,
            startDate: config.activityStartDate,
            rollTime: config.activityStartDate,
            endDate: config.activityEndDate,
            timeLeft: timeLeft
        }
    };
}

exports.getActivityStatus = function (req, res) {
    return res.jsonp(getActivityStatus(req.query.platform));
};

exports.getPurchasePage = function (req, res) {
    var status = getActivityStatus(req.query.platform);
    switch (status.activityStatus) {
        case 'NotBegin':
            res.render('panic-purchase-activity/count-down', status);
            break;
        case 'Ongoing':
            res.render('panic-purchase-activity/instant-purchase');
            break;
        case 'End':
            res.render('panic-purchase-activity/end');
            break;
        default:
            res.render('panic-purchase-activity/end');
    }
};

exports.getDetail = function (req, res) {
    res.render('panic-purchase-activity/reward-introduction');
};

exports.purchase = function (req, res) {
    var activityStatus = getActivityStatus(req.query.platform).activityStatus;
    if (activityStatus === 'NotBegin') return res.jsonp(statusCode.ACTIVITY_NOT_BRGIN);
    if (activityStatus === 'End') return res.jsonp(statusCode.ACTIVITY_ENDED);

    async.waterfall([
        function (cb) {
            PageRank.findOne({_id: req.user.id}, function (err, rank) {
                if (err) {
                    cb(statusCode.DATABASE_ERROR);
                }
                else if (rank) {
                    cb(statusCode.ACTIVITY_PARTICIPATED);
                }
                else {
                    cb(null);
                }
            });
        },
        function (cb) {
            Counter.getNextSequenc('purchaseCounter', function (err, count) {
                if (err) {
                    cb(statusCode.DATABASE_ERROR);
                }
                if (count > 215) {
                    cb(statusCode.ACTIVITY_TASK_FULL);
                }
                cb(null, count);
            });
        },
        function (count, cb) {
            var pageRank = new PageRank({
                _id: req.user.id,
                rank: count
            });
            pageRank.save(function (err, rank) {
                if (err) cb(statusCode.DATABASE_ERROR);
                cb(null, rank);
            });
        }
    ], function (err, rank) {
        if (err) return res.jsonp(err);
        return res.jsonp({
            statusCode: statusCode.SUCCESS.statusCode,
            rank: rank.rank
        });
    });
};

