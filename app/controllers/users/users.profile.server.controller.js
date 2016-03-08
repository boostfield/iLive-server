'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    errorHandler = require('../errors.server.controller.js'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    User = mongoose.model('User'),
    TaskEvent = mongoose.model('TaskEvent'),
    Picture = mongoose.model('Picture'),
    ApiRecord = mongoose.model('ApiRecord'),
    async = require('async'),
    statusCode = require('../../utils/status-code');


/**
 * Update user details
 */
exports.update = function (req, res) {
    // Init Variables
    var user = req.user;

    // For security measurement we remove the roles from the req.body object
    delete req.body.roles;
    delete req.body.username;
    delete req.body.password;
    delete req.body.currentLocation;
    var updatedKeys = req.body;
    // Merge existing user
    user = _.extend(user, req.body);
    user.updated = Date.now();
    user.save(function (err) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.UPDATE_INFO_FAILED.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var updatedFields = {};
            for (var key in updatedKeys) {
                updatedFields[key] = user[key];
            }
            res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                updatedFields: updatedFields
            });
        }
    });
};

exports.deleteImagesInAlbum = function (req, res) {
    var user = req.user;
    delete req.body.roles;
    delete req.body.username;
    delete req.body.password;
    if (!req.body.imagesToDelete || !(req.body.imagesToDelete instanceof Array)) {
        return res.status(200).jsonp({
            statusCode: statusCode.PARSING_ERR.statusCode,
            message: statusCode.PARSING_ERR.message
        });
    }
    var imgsToDelete = req.body.imagesToDelete;
    for (var index in imgsToDelete) {
        var indexToDelete = user.album.indexOf(imgsToDelete[index]);
        if (indexToDelete !== -1) {
            user.album.splice(indexToDelete, 1);
        }
    }
    user.save(function (err, updatedUser) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                album: updatedUser.album
            });
        }
    });
};
/**
 * 获取我的个人信息。
 */
exports.me = function (req, res) {
    var me = JSON.parse(JSON.stringify(req.user));
    //删除与地理位置相关的数据。
    delete me.currentLocation;
    delete me.currentScenicSpot;
    delete me.locationLastUpdated;
    delete me.accessToken;

    return res.json({
        statusCode: statusCode.SUCCESS.statusCode,
        user: me
    });
};
/**
 * 获取指定用户的个人信息。
 * @param req
 * @param res
 */
exports.getUserInfo = function (req, res) {
    async.parallel({
        user: function (cb) {
            User.findById(req.params.userId, {
                displayName: 1,
                avatarUrl: 1,
                gender: 1,
                bonusPoint: 1
            }).exec(function (err, user) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, user);
                }
            });
        },
        finishedTaskCount: function (cb) {
            TaskEvent.count({
                starredUser: req.params.userId,
                status: {$ne: 'unfinished'}
            }, function (err, finishedCount) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, finishedCount);
                }
            });
        },
        successTaskCount: function (cb) {
            TaskEvent.count({
                starredUser: req.params.userId,
                status: 'success'
            }, function (err, successCount) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, successCount);
                }
            });
        }
    }, function (err, result) {
        if (err) {
            return res.jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        } else {
            var userInfo = JSON.parse(JSON.stringify(result.user));
            userInfo.successRate = result.finishedTaskCount === 0 ? 0 : Math.ceil((result.successTaskCount / result.finishedTaskCount) * 100);
            userInfo.successTaskCount = result.successTaskCount;
            userInfo.finishedTaskCount = result.finishedTaskCount;

            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                user: userInfo
            });
        }

    });

};

exports.list = function (req, res) {
    var queryObject = {isDeleted: {$ne: true}};
    if (req.query.role) {
        queryObject.roles = req.query.role;
    }

    //TODO:权限控制！！！
    async.parallel({
        total: function (callback) {
            User.count(queryObject, function (err, count) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, count);
                }
            });
        },
        users: function (callback) {
            var pageSize = req.query.pageSize ? req.query.pageSize : 999999;
            var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;

            User.find(queryObject, {displayName: 1, avatarUrl: 1, gender: 1})
                .skip(pageSize * pageNumber)
                .limit(pageSize)
                .exec(function (err, users) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, users);
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
                users: result.users
            });
        }
    });
};

exports.getUsersBriefInfoByUsernames = function (req, res) {
    var usernames = [];

    if (!req.body.usernames || !(req.body.usernames instanceof Array)) {
        return res.status(200).jsonp({
            statusCode: statusCode.PARSING_ERR.statusCode,
            message: statusCode.PARSING_ERR.message
        });
    }
    for (var index in req.body.usernames) {
        usernames.push(req.body.usernames[index].username);

    }
    User.find({username: {$in: usernames}}, {
        username: 1,
        avatarUrl: 1,
        displayName: 1,
        gender: 1
    }, function (err, users) {

        //对返回结果进行排序，以匹配请求中的顺序。
        var sortedUser = [];
        for (var i = 0; i < usernames.length; i++) {
            for (var j = 0; j < users.length; j++) {
                if (usernames[i] === users[j].username) {
                    sortedUser[i] = users[j];
                    break;
                }
            }
        }
        return res.jsonp({
            statusCode: statusCode.SUCCESS.statusCode,
            users: sortedUser,
            total: sortedUser.length
        });
    });
};

exports.getUserInfoByUsername = function (req, res) {
    User.findOne({username: req.params.username}, {
        avatarUrl: 1,
        gender: 1,
        displayName: 1,
        username: 1
    }).exec(function (err, user) {
        if (err) {
            return res.status(200).send({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.json({
                statusCode: statusCode.SUCCESS.statusCode,
                user: user
            });
        }
    });
};

/**
 * 根据用户昵称中搜索用户。
 * @param req
 * @param res
 * @returns {*}
 */
exports.search = function (req, res) {
    if (req.query.keyword === undefined) {
        return res.status(200).send(statusCode.ARGUMENT_REQUIRED);
    }
    var queryObject = {isDeleted: {$ne: true}};

    if (req.query.keyword) {
        var queryReg = '';
        try {
            queryReg = new RegExp(req.query.keyword, 'i');
        } catch (err) {
            return res.status(200).send({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        }
        queryObject.displayName = queryReg;
    }
    async.parallel({
        total: function (callback) {
            User.count(queryObject, function (err, count) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, count);
                }
            });
        },
        users: function (callback) {
            var pageSize = req.query.pageSize ? req.query.pageSize : 10;
            var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
            User.find(queryObject, {
                avatarUrl: 1,
                gender: 1,
                displayName: 1
            }).skip(pageSize * pageNumber)
                .limit(pageSize)
                .exec(function (err, users) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, users);
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
                users: result.users
            });
        }
    });
};

//获取商户列表
exports.getTenants = function (req, res) {
    async.parallel({
        total: function (callback) {
            User.count({'roles': 'tenant'}, function (err, count) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, count);
                }
            });
        },
        users: function (callback) {
            var pageSize = req.query.pageSize ? req.query.pageSize : 999999;
            var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;

            User.find({'roles': 'tenant'}, {displayName: 1})
                .sort('-created')
                .skip(pageSize * pageNumber)
                .limit(pageSize)
                .exec(function (err, users) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, users);
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
                users: result.users
            });
        }
    });
};

exports.getPicturesByScenicSpots = function (req, res) {
    var resultQuery;
    if (req.params.userId) {
        resultQuery = Picture.find({'belongToUser': req.params.userId, isDeleted: {$ne: true}});
    } else {
        resultQuery = Picture.find({'belongToUser': req.user.id, isDeleted: {$ne: true}});
    }
    resultQuery.populate('belongToScenicSpot', 'name checked isDeleted')
        .sort('belongToScenicSpot')
        .exec(function (err, pictures) {
            if (err) {
                return res.status(200).jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: statusCode.DATABASE_ERROR.message
                });
            } else {
                var resultObj = {};
                //将图片按照景点分类，使用obj key判定所属景点。
                for (var index in pictures) {
                    if (pictures[index].belongToScenicSpot.checked !== 'pass' || pictures[index].belongToScenicSpot.isDeleted === true) {
                        continue;
                    }
                    //该景点在结果集resultObj中不存在，则添加一个结果
                    if (resultObj[pictures[index].belongToScenicSpot._id] === undefined) {
                        resultObj[pictures[index].belongToScenicSpot._id] = {
                            id: pictures[index].belongToScenicSpot._id,
                            name: pictures[index].belongToScenicSpot.name,
                            pictures: [],
                            updatedAt: pictures[index].createdAt
                        };
                        resultObj[pictures[index].belongToScenicSpot._id].pictures.push(pictures[index]);
                    } else {
                        //如果已存在，直接push进pictures
                        resultObj[pictures[index].belongToScenicSpot._id].pictures.push(pictures[index]);
                        if (resultObj[pictures[index].belongToScenicSpot._id].updatedAt < pictures[index].createdAt) {
                            resultObj[pictures[index].belongToScenicSpot._id].updatedAt = pictures[index].createdAt;
                        }
                    }
                }

                //将结果转化为数组。
                var resultArray = [];
                for (var property in resultObj) {
                    if (resultObj.hasOwnProperty(property)) {
                        resultArray.push(resultObj[property]);
                    }
                }
                //将结果按照时间顺序逆序。
                resultArray = _.sortBy(resultArray, function (item) {
                    return Date.parse(item.updatedAt) * -1;
                });

                //将结果分页。
                var resultSize = resultArray.length;
                var pageSize = req.query.pageSize ? req.query.pageSize : 10;
                var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
                resultArray = resultArray.splice(pageNumber * pageSize, pageSize);
                for (index = 0; index < resultArray.length; index++) {
                    resultArray[index].photosCount = resultArray[index].pictures.length;
                }
                return res.jsonp({
                    total: resultSize,
                    statusCode: statusCode.SUCCESS.statusCode,
                    scenicSpots: resultArray
                });
            }
        });
};

exports.getUserUploadedPictureByScenicSpot = function (req, res) {
    var resultQuery;
    var countQuery;
    if (req.params.userId) {
        countQuery = Picture.count({
            'belongToUser': req.params.userId,
            belongToScenicSpot: req.params.scenicSpotId,
            isDeleted: {$ne: true}
        });
        resultQuery = Picture.find({
            'belongToUser': req.params.userId,
            belongToScenicSpot: req.params.scenicSpotId,
            isDeleted: {$ne: true}
        });
    } else {
        countQuery = Picture.count({
            'belongToUser': req.user.id,
            belongToScenicSpot: req.params.scenicSpotId,
            isDeleted: {$ne: true}
        });
        resultQuery = Picture.find({
            'belongToUser': req.user.id,
            belongToScenicSpot: req.params.scenicSpotId,
            isDeleted: {$ne: true}
        });
    }
    var pageSize = req.query.pageSize ? req.query.pageSize : 10;
    var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
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
        pictures: function (callback) {
            resultQuery.skip(pageSize * pageNumber)
                .limit(pageSize)
                .exec(function (err, pictures) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, pictures);
                    }
                });
        }
    }, function (err, results) {
        if (err) {
            return res.status(200).send({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.json({
                statusCode: statusCode.SUCCESS.statusCode,
                photosCount: results.total,
                pictures: results.pictures
            });
        }
    });

};

/**
 * 根据关键字搜索商户。
 * @param req
 * @param res
 * @returns {*}
 */
exports.searchTenant = function (req, res) {
    var queryObject = {isDeleted: {$ne: true}, 'roles': 'tenant'};
    if (req.query.keyword !== 'undefined') {
        var queryReg = '';
        try {
            queryReg = new RegExp(req.query.keyword, 'i');
        } catch (err) {
            return res.status(200).send({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        }
        queryObject.displayName = queryReg;
    }
    async.parallel({
        total: function (callback) {
            User.count(queryObject, function (err, count) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, count);
                }
            });
        },
        users: function (callback) {
            var pageSize = req.query.pageSize ? req.query.pageSize : 10;
            var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
            User.find(queryObject, {
                avatarUrl: 1,
                gender: 1,
                displayName: 1
            })
                .sort('-created')
                .skip(pageSize * pageNumber)
                .limit(pageSize)
                .exec(function (err, users) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, users);
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
                users: result.users
            });
        }
    });
};

exports.updateTenantDisplayName = function (req, res) {
    User.findOneAndUpdate({'_id': req.params.userId}, {
        displayName: req.body.newDisplayName,
        updated: Date.now()
    }).exec(function (err, user) {
        if (err) {
            return res.status(200).send({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                newDisplayName: user.displayName
            });
        }
    });
};

exports.getUserOperationRecorders = function (req, res) {
    var begin = new Date(new Date(req.query.beginDate).getFullYear(), new Date(req.query.beginDate).getMonth(), new Date(req.query.beginDate).getDate());
    var end = new Date(new Date(req.query.endDate).getFullYear(), new Date(req.query.endDate).getMonth(), new Date(req.query.endDate).getDate() + 1);
    async.parallel({
            //根据关键字在任务名中搜索
            newDownloadCount: function (callback) {
                ApiRecord.count({
                    'created': {
                        $lt: end,
                        $gt: begin
                    }
                }, {
                    created: 1,
                    displayName: 1
                }).exec(function (err, apiRecordCount) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, apiRecordCount);
                    }
                });

            },
            //根据关键字在任务名中搜索
            newUserCount: function (callback) {
                User.count({
                    'created': {
                        $lt: end,
                        $gt: begin
                    }
                }, {
                    created: 1,
                    displayName: 1
                }).exec(function (err, usersCount) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, usersCount);
                    }
                });

            },
            //根据关键字在商家中搜索
            finishTaskCount: function (callback) {
                TaskEvent.count({
                    'finishedTime': {
                        $lt: end,
                        $gt: begin
                    }
                }, {
                    starredTime: 1,
                    finishedTime: 1,
                    status: 1
                }).exec(function (err, finishTaskCount) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, finishTaskCount);
                    }
                });

            },
            starTaskCount: function (callback) {
                TaskEvent.count({
                    'starredTime': {
                        $lt: end,
                        $gt: begin
                    }
                }, {
                    starredTime: 1,
                    finishedTime: 1,
                    status: 1
                }).exec(function (err, starTaskCount) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, starTaskCount);
                    }
                });
            }
        },
        function (err, results) {
            if (err) {
                return res.status(200).send({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: errorHandler.getErrorMessage(err)
                });
            }
            else {
                return res.jsonp({
                    statusCode: statusCode.SUCCESS.statusCode,
                    newDownloadCount: results.newDownloadCount,
                    newUserCount: results.newUserCount,
                    starTaskCount: results.starTaskCount,
                    finishTaskCount: results.finishTaskCount
                });
            }
        });
};
