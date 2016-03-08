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
    ScenicSpot = mongoose.model('ScenicSpot');

/**
 *获取“我”更新过的景点的列表，按照更新时间排序。
 */
exports.getUpdatedScenicSpotList = function (req, res) {
    async.parallel({
        total: function (callback) {
            ScenicSpot.count({updatedByUser: req.params.userId, 'isDeleted': {$ne: true}}, function (err, count) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, count);
                }
            });
        },
        scenicSpots: function (callback) {
            var pageSize = req.query.pageSize ? req.query.pageSize : 10;
            var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;

            ScenicSpot.find({updatedByUser: req.params.userId, checked: 'pass', 'isDeleted': {$ne: true}})
                .populate('city', 'name coverUrl _id')
                .populate('province', 'name')
                .populate('pictures', 'coverUrl _id')
                .sort('updated')
                .skip(pageSize * pageNumber)
                .limit(pageSize)
                .exec(function (err, scenicSpots) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, scenicSpots);
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
                scenicSpots: result.scenicSpots
            });
        }
    });
};

/**
 * 获取特定用户所创建的景点的列表，按照创建时间排序。
 */
exports.getCreatedScenicSpotList = function (req, res) {
    async.parallel({
        total: function (callback) {
            ScenicSpot.count({belongToUser: req.params.userId, 'isDeleted': {$ne: true}}, function (err, count) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, count);
                }
            });
        },
        scenicSpots: function (callback) {
            var pageSize = req.query.pageSize ? req.query.pageSize : 10;
            var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;

            ScenicSpot.find({belongToUser: req.params.userId, checked: 'pass', 'isDeleted': {$ne: true}})
                .populate('city', 'name coverUrl _id')
                .populate('province', 'name')
                .populate('pictures', 'coverUrl _id')
                .sort('created')
                .skip(pageSize * pageNumber)
                .limit(pageSize)
                .exec(function (err, scenicSpots) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, scenicSpots);
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
                scenicSpots: result.scenicSpots
            });
        }
    });
};

/**
 * 获取“我”所创建的景点的列表，按照创建时间排序。
 */
exports.getUserCreatedScenicSpotList = function (req, res) {
    var resultQuery, countQuery;
    if (req.params.userId) {
        resultQuery = ScenicSpot.find({belongToUser: req.params.userId, checked: 'pass', 'isDeleted': {$ne: true}});
        countQuery = ScenicSpot.count({belongToUser: req.params.userId, checked: 'pass', 'isDeleted': {$ne: true}});
    } else {
        resultQuery = ScenicSpot.find({belongToUser: req.user.id, checked: 'pass', 'isDeleted': {$ne: true}});
        countQuery = ScenicSpot.count({belongToUser: req.user.id, checked: 'pass', 'isDeleted': {$ne: true}});
    }
    async.parallel({
        total: function (callback) {
            countQuery.exec(function (err, count) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, count);
                }
            });
        },
        scenicSpots: function (callback) {
            var pageSize = req.query.pageSize ? req.query.pageSize : 10;
            var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;

            resultQuery.populate('city', 'name coverUrl _id')
                .populate('belongToUser', 'username displayName avatarUrl tagColor currentTag gender')
                .populate('province', 'name')
                .populate('pictures', 'coverUrl _id')
                .sort('created')
                .skip(pageSize * pageNumber)
                .limit(pageSize)
                .exec(function (err, scenicSpots) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, scenicSpots);
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
            //每个景点返回coverUrl，如果没有，赋值为album[0]
            //by erBingWang
            for (var index in result.scenicSpots) {
                if (!result.scenicSpots[index].hasOwnProperty('coverUrl') && result.scenicSpots[index].hasOwnProperty('album') && result.scenicSpots[index].album.length !== 0) {
                    result.scenicSpots[index].coverUrl = result.scenicSpots[index].album[0];
                }
            }

            return res.json({
                statusCode: statusCode.SUCCESS.statusCode,
                total: result.total,
                scenicSpots: result.scenicSpots
            });
        }
    });
};

/**
 * 获取我想去的景点列表。
 */
exports.getMyVotedScenicspots = function (req, res) {
    async.parallel({
        total: function (callback) {
            ScenicSpot.count({'voteUser': req.user.id, 'isDeleted': {$ne: true}}, function (err, count) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, count);
                }
            });
        },
        scenicSpots: function (callback) {
            var pageSize = req.query.pageSize ? req.query.pageSize : 10;
            var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;

            ScenicSpot.find({'voteUser': req.user.id, checked: 'pass', 'isDeleted': {$ne: true}})
                .populate('city', 'name coverUrl _id')
                .populate('belongToUser', 'username displayName avatarUrl tagColor currentTag gender')
                .populate('province', 'name')
                .populate('pictures', 'coverUrl _id')
                .sort('created')
                .skip(pageSize * pageNumber)
                .limit(pageSize)
                .exec(function (err, scenicSpots) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, scenicSpots);
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
            //每个景点返回coverUrl，如果没有，赋值为album[0]
            //by erBingWang
            for (var index in result.scenicSpots) {
                if (!result.scenicSpots[index].hasOwnProperty('coverUrl') && result.scenicSpots[index].hasOwnProperty('album') && result.scenicSpots[index].album.length !== 0) {
                    result.scenicSpots[index].coverUrl = result.scenicSpots[index].album[0];
                }
            }
            return res.json({
                statusCode: statusCode.SUCCESS.statusCode,
                total: result.total,
                scenicSpots: result.scenicSpots
            });
        }
    });
};
