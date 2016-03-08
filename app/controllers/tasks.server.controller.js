'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Task = mongoose.model('Task'),
    TaskList = mongoose.model('TaskList'),
    User = mongoose.model('User'),
    Picture = mongoose.model('Picture'),
    ScenicSpot = mongoose.model('ScenicSpot'),
    TaskEvent = mongoose.model('TaskEvent'),
    Comment = mongoose.model('Comment'),
    config = require('../../config/config'),
    statusCode = require('../utils/status-code'),
    broadcastController = require('./broadcast-messages.server.controller.js'),
    BonusController = require('./bonus.server.controller'),
    async = require('async'),
    _ = require('lodash');

var NEAR_SCENICSPOT_RADIUS = 5000;
var EARTH_RADIUS = 6378.100; //赤道长度，千米

/**
 * Create a Task
 */
exports.create = function (req, res) {
    var task = new Task(req.body);
    //当前任务均由流连君创建
    task.createdByUser = config.liulianAdmin;

    ScenicSpot.findById(task.belongToScenicSpot, 'geoLocation').exec(function (err, scenicSpot) {
        if (err) {
            return res.jsonp(statusCode.DATABASE_ERROR);
        }
        if (!scenicSpot) {
            return res.jsonp(statusCode.SCENIC_SPOT_NOT_EXIST);
        }
        task.location = scenicSpot.geoLocation;
        task.save(function (err, task) {
            if (err) {
                return res.status(200).send({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp({
                    statusCode: statusCode.SUCCESS.statusCode,
                    taskId: task.id
                });
            }
        });
    });
};

/**
 * Show the current Task
 */
exports.read = function (req, res) {
    var task = req.task;
    return res.jsonp({
        statusCode: statusCode.SUCCESS.statusCode,
        task: task
    });
};

exports.search = function (req, res) {
    if (!req.query.keyword) {
        return res.jsonp(statusCode.ARGUMENT_REQUIRED);
    }
    var taskQueryObject = {isDeleted: {$ne: true}};
    var tenantQueryObject = {roles: 'tenant'};
    var taskKeywordSearchByTenant = {isDeleted: {$ne: true}};
    if (!req.user || (req.user.roles.indexOf('admin') === -1)) {//普通用户权限
        taskQueryObject.isActivity = {$ne: true};
        taskKeywordSearchByTenant.isActivity = {$ne: true};
    }
    var queryReg = '';
    try {
        queryReg = new RegExp(req.query.keyword, 'i');
    } catch (err) {
        return res.status(200).send({
            statusCode: statusCode.DATABASE_ERROR.statusCode,
            message: errorHandler.getErrorMessage(err)
        });
    }
    taskQueryObject.name = queryReg;
    tenantQueryObject.displayName = queryReg;

    async.parallel({
            //根据关键字在任务名中搜索
            keywordTasks: function (callback) {
                Task.find(taskQueryObject, {
                    name: 1,
                    city: 1,
                    area: 1,
                    coverUrl: 1,
                    bonus: 1,
                    quota: 1,
                    belongToUser: 1,
                    belongToScenicSpot: 1
                })
                    .populate('city', 'name')
                    .populate('area', 'name')
                    .populate('belongToUser', 'displayName')
                    .populate('belongToScenicSpot', 'name')
                    .sort('-created')
                    .exec(function (err, tasks) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(err, tasks);
                        }
                    });
            },

            //根据关键字在商家中搜索
            tenantTasks: function (callback) {
                User.find(tenantQueryObject, {_id: 1})
                    .exec(function (err, tenants) {
                        if (err) {
                            callback(err);
                        }
                        var tenantsId = _.pluck(tenants, '_id');
                        taskKeywordSearchByTenant.belongToUser = {$in: tenantsId};
                        Task.find(taskKeywordSearchByTenant, {
                            name: 1,
                            city: 1,
                            area: 1,
                            coverUrl: 1,
                            bonus: 1,
                            quota: 1,
                            belongToUser: 1,
                            belongToScenicSpot: 1
                        })
                            .populate('city', 'name')
                            .populate('area', 'name')
                            .populate('belongToUser', 'displayName')
                            .populate('belongToScenicSpot', 'name')
                            .sort('-created')
                            .exec(function (err, tasks) {
                                if (err) {
                                    callback(err);
                                } else {
                                    callback(err, tasks);
                                }
                            });
                    });
            }
        },
        function (err, results) {
            if (err) {
                return res.jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: err.message
                });
            }
            var result = _(results.keywordTasks).concat(results.tenantTasks).value();
            result = _.unique(result, function (item) {
                return item.id;
            });
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                total: result.length,
                tasks: result
            });
        });

};

exports.readWithStatus = function (req, res) {
    var task = JSON.parse(JSON.stringify(req.task));
    delete task.quotaRecord;
    delete task.finishedUser;
    delete task.starredUser;
    if (!req.user) {
        return res.jsonp({
            statusCode: statusCode.SUCCESS.statusCode,
            task: task
        });
    } else {
        TaskEvent.findOne({
            belongToTask: task.id,
            starredUser: req.user.id,
            taskIsDeleted: false,
            starredFromTask: true
        }, {
            verifyCode: 1,
            status: 1,
            rating: 1
        }).exec(function (err, taskEvent) {
            if (err) {
                return res.status(200).jsonp({
                    statusCode: statusCode.SUCCESS.statusCode,
                    message: err.message
                });
            }
            if (taskEvent) {
                task.status = taskEvent.status;
                task.isStarred = true;
                if (task.status === 'unfinished') {
                    task.verifyCode = taskEvent.verifyCode;
                }
                task.rating = taskEvent.rating;
            }
            if (!taskEvent) {
                task.isStarred = false;
            }
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                task: task
            });
        });
    }
};

exports.getStarredUser = function (req, res) {
    var pageSize = req.query.pageSize ? req.query.pageSize : 10;
    var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
    var total = req.task.starredUser.length;
    async.waterfall([
        function (cb) {
            TaskEvent.find({belongToTask: req.task.id, starredFromTask: true})
                .skip(pageNumber * pageSize)
                .limit(pageSize)
                .sort({starredTime: -1})
                .exec(function (err, taskEvents) {
                    if (err) {
                        cb(statusCode.DATABASE_ERROR);
                    } else {
                        var starredUsers = _.pluck(taskEvents, 'starredUser');
                        cb(null, starredUsers);
                    }
                });
        },
        function (starredUsers, cb) {
            User.find({_id: {$in: starredUsers}}, 'displayName avatarUrl gender').exec(function (err, users) {
                if (err) {
                    cb(statusCode.DATABASE_ERROR);
                } else {
                    //将starredUsers转化为字符串，便于之后比较。
                    for (var index in starredUsers) {
                        starredUsers[index] = starredUsers[index].toString();
                    }
                    for (index in users) {
                        //获取user在starredUser中的位置
                        var indexUser = starredUsers.indexOf(users[index].id);

                        starredUsers[indexUser] = users[index];
                    }
                    cb(null, starredUsers);
                }
            });
        }
    ], function (err, users) {
        if (err) {
            return res.jsonp(err);
        } else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                total: total,
                users: users
            });
        }
    });
};

exports.getPictures = function (req, res) {
    var pageSize = req.query.pageSize ? req.query.pageSize : 10;
    var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
    var total = req.task.pictures.length;
    var selectedPictures = req.task.pictures.splice(pageNumber * pageSize, pageSize);
    Picture.find({_id: {$in: selectedPictures}}, {
        coverUrl: 1
    }).exec(function (err, pictures) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                message: err.message
            });
        } else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                total: total,
                pictures: pictures
            });
        }
    });
};

/**
 * Update a Task
 */
exports.update = function (req, res) {
    var task = req.task;
    task = _.extend(task, req.body);
    task.save(function (err) {
        if (err) {
            return res.status(200).send({
                statusCode: statusCode.PARSING_ERR.statusCode,
                message: err.message
            });
        } else {
            var notificationContent = '您收藏的任务：' + task.name + '有改动，请点击查看。';
            broadcastController.createMessage(task.starredUser, task.id, null, 'Task', task.id, task.name, notificationContent, true, 'update', function (err, result) {
                if (err) {
                    return res.status(200).jsonp(err);
                } else {
                    return res.jsonp({
                        statusCode: statusCode.SUCCESS.statusCode
                    });
                }
            });
        }
    });
};

/**
 * Delete an Task
 */
exports.delete = function (req, res) {
    async.waterfall([
            function (cb) {
                Comment.update({'originId': req.params.taskId}, {$set: {'isDeleted': true}}).exec(function (err) {
                    if (err) {
                        cb(err);
                    } else {
                        cb();
                    }
                });
            },
            function (cb) {
                TaskEvent.update({belongToTask: req.params.taskId}, {$set: {'taskIsDeleted': true}}, {multi: true})
                    .exec(function (err, taskEvents) {
                        if (err) {
                            cb(err);
                        } else {
                            cb();
                        }
                    });
            },
            function (cb) {
                TaskList.find({'tasks': req.params.taskId}, function (err, taskLists) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, taskLists);
                    }
                });
            },
            function (taskLists, cb) {
                var index = 0;
                async.whilst(
                    function () {
                        return index < taskLists.length;
                    },
                    function (callback) {
                        TaskList.findOneAndUpdate({'_id': taskLists[index]._id}, {$pull: {'tasks': req.params.taskId}}, function (err) {
                            if (err) {
                                cb(err);
                            } else {
                                index++;
                                callback();
                            }

                        });
                    },
                    function () {
                        cb();
                    }
                );
            },
            function (cb) {
                Task.findOneAndUpdate({'_id': req.params.taskId}, {$set: {'isDeleted': true}}).exec(function (err, task) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, task);
                    }
                });
            },
            function (task, cb) {
                var notificationContent = '您收藏的玩鲜任务：' + task.name + '已下架';
                broadcastController.createMessage(task.starredUser, req.params.taskId, null, 'Task', req.params.taskId, task.name, notificationContent, true, 'delete', function (err) {
                    if (err) {
                        cb(err);
                    } else {
                        cb();
                    }
                });
            }
        ],
        function (err) {
            if (err) {
                return res.status(200).send({
                    statusCode: statusCode.PARSING_ERR.statusCode,
                    message: err.message
                });
            } else {
                res.jsonp(statusCode.SUCCESS);
            }
        }
    );
};

var getTaskArrayStatus = function (userId, tasks, callback) {
    async.each(tasks,
        function (task, cb) {
            var queryObject = {
                taskIsDeleted: {$ne: true},
                starredUser: userId,
                belongToTask: task.id
            };
            TaskEvent.findOne(queryObject).exec(function (err, taskEvent) {
                if (err) {
                    cb(err);
                }
                if (taskEvent && taskEvent.starredFromTask) {
                    task.status = taskEvent.status;
                    task.isStarred = true;
                }
                if (!taskEvent) {
                    task.isStarred = false;
                }
                cb();
            });
        },
        function (err) {
            if (err) {
                callback(err);
            } else {
                callback(err, tasks);
            }
        }
    );
};
exports.getTaskArrayStatus = getTaskArrayStatus;

/**
 * List of Tasks
 */
exports.list = function (req, res) {
    var queryObject = {isDeleted: {$ne: true}};
    if (!req.user || (req.user.roles.indexOf('admin') === -1)) {//普通用户权限
        queryObject.isActivity = {$ne: true};
    }
    if (req.query.city) {
        queryObject.city = req.query.city;
    }
    if(req.query.area){
        queryObject.area = req.query.area;
    }
    if (req.query.belongToUser) {
        queryObject.belongToUser = req.query.belongToUser;
    }
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
        queryObject.name = queryReg;
    }
    async.parallel({
            total: function (callback) {
                Task.count(queryObject, function (err, count) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, count);
                    }
                });
            },
            tasks: function (callback) {
                var pageSize = req.query.pageSize ? req.query.pageSize : 10;
                var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
                Task.find(queryObject, {
                    name: 1,
                    city: 1,
                    area: 1,
                    coverUrl: 1,
                    bonus: 1,
                    quota: 1,
                    finishedUserCount: 1,
                    successUserCount: 1,
                    belongToUser: 1,
                    belongToScenicSpot: 1,
                    briefInfo: 1
                })
                    .populate('city', 'name')
                    .populate('area', 'name')
                    .populate('belongToUser', 'displayName')
                    .populate('belongToScenicSpot', 'name')
                    .skip(pageSize * pageNumber)
                    .limit(pageSize)
                    .sort('-created')
                    .exec(function (err, tasks) {
                        if (err) {
                            callback(err);
                        } else {
                            if (req.user) {
                                tasks = JSON.parse(JSON.stringify(tasks));
                                getTaskArrayStatus(req.user.id, tasks, function (err, tasks) {
                                    callback(err, tasks);
                                });
                            } else {
                                callback(err, tasks);
                            }
                        }
                    });
            }
        },
        function (err, result) {
            if (err) {
                return res.status(200).send({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: err.message
                });
            } else {
                return res.json({
                    statusCode: statusCode.SUCCESS.statusCode,
                    total: result.total,
                    tasks: result.tasks
                });
            }
        }
    );
};
exports.getTasksByLocation = function (req, res) {
    if (!req.query.lng && !req.query.lat) {
        return res.jsonp(statusCode.PARSING_ERR);
    }
    var location = [parseFloat(req.query.lng), parseFloat(req.query.lat)];
    var pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
    var pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 0;
    var queryObject = {isDeleted: {$ne: true}};
    if(req.query.city){
        queryObject.city = mongoose.Types.ObjectId(req.query.city);
    }
    if(req.query.area){
        queryObject.area = mongoose.Types.ObjectId(req.query.area);
    }
    if (!req.user || (req.user.roles.indexOf('admin') === -1)) {//普通用户权限
        queryObject.isActivity = {$ne: true};
    }
    async.parallel({
            total: function (callback) {
                Task.count(queryObject).exec(function (err, count) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, count);
                    }
                });
            },
            tasks: function (callback) {
                Task.aggregate([
                    {
                        $geoNear: {
                            spherical: true,
                            maxDistance: NEAR_SCENICSPOT_RADIUS,
                            near: location,
                            distanceField: 'distance'
                        }
                    },
                    {$match: queryObject},
                    {
                        $project: {
                            id: '$_id',
                            name: 1,
                            city: 1,
                            area: 1,
                            coverUrl: 1,
                            bonus: 1,
                            quota: 1,
                            rule: 1,
                            finishedUserCount: 1,
                            belongToUser: 1,
                            servicePeriod: 1,
                            belongToScenicSpot: 1,
                            briefInfo: 1,
                            distance: 1
                        }
                    },
                    {$skip: pageNumber * pageSize},
                    {$limit: pageSize}
                ])
                    .exec(function (err, tasks) {
                        if (err) {
                            callback(err);
                        }
                        Task.populate(tasks, [
                            {path: 'belongToUser', select: 'displayName'},
                            {path: 'city', select: 'name'},
                            {path: 'area', select: 'name'},
                            {path: 'belongToScenicSpot', select: 'name address geoLocation'}
                        ], function (err, tasks) {
                            if (err) {
                                callback(err);
                            }
                            var userId = req.user ? req.user.id : null;
                            getTaskArrayStatus(userId, tasks, function (err, tasks) {
                                for (var index in tasks) {
                                    //弧度转换为距离。
                                    tasks[index].distance *= EARTH_RADIUS;
                                }
                                callback(null, tasks);
                            });
                        });
                    });
            }
        }, function (err, result) {
            if (err) {
                return res.jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    mesage: err.message
                });
            }
            var tasks = JSON.parse(JSON.stringify(result.tasks));
            for (var index in tasks) {
                tasks[index].distance = (tasks[index].distance * 1000).toFixed(2);
            }
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                total: result.total,
                tasks: tasks
            });
        }
    );
};

exports.starredTask = function (req, res) {
    var queryObject = {
        taskIsDeleted: {$ne: true},
        starredUser: req.user._id,
        starredFromTask: true
    };

    if (req.query.status) {
        if (req.query.status === 'finished') {
            queryObject.status = {$ne: 'unfinished'};
        } else {
            queryObject.status = req.query.status;
        }
    }
    var pageSize = req.query.pageSize ? req.query.pageSize : 10;
    var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;

    async.waterfall([
        function (cb) {
            TaskEvent.count(queryObject).exec(function (err, count) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, count);
                }
            });
        },
        function (count, cb) {
            TaskEvent.find(queryObject, {belongToTask: 1})
                .skip(pageSize * pageNumber)
                .limit(pageSize)
                .sort({starredTime: -1})
                .exec(function (err, tasks) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, count, tasks);
                    }
                });
        },
        function (count, taskIdsObj, cb) {
            var taskIdArray = [];
            for (var index in taskIdsObj) {
                taskIdArray.push(taskIdsObj[index].belongToTask.toString());
            }

            Task.find({_id: {$in: taskIdArray}, isDeleted: {$ne: true}}, {
                    name: 1,
                    city: 1,
                    area: 1,
                    coverUrl: 1,
                    bonus: 1,
                    quota: 1,
                    rule: 1,
                    finishedUserCount: 1,
                    belongToUser: 1,
                    servicePeriod: 1,
                    belongToScenicSpot: 1,
                    briefInfo: 1
                }
            )
                .populate('city', 'name')
                .populate('area', 'name')
                .populate('belongToUser', 'displayName')
                .populate('belongToScenicSpot', 'name address geoLocation')
                .sort('-created').exec(function (err, tasks) {
                    if (err) {
                        cb(err);
                    } else {
                        tasks = JSON.parse(JSON.stringify(tasks));
                        getTaskArrayStatus(req.user._id, tasks, function (err, tasks) {
                            for (var index in tasks) {
                                var indexInIdArray = taskIdArray.indexOf(tasks[index].id);
                                taskIdArray[indexInIdArray] = tasks[index];
                                delete tasks[index].isStarred;
                            }
                            cb(null, count, taskIdArray);
                        });
                    }
                });
        }
    ], function (err, count, tasks) {
        if (err) {
            return res.status(200).send({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                total: count,
                tasks: tasks
            });
        }
    });
};

exports.getVerifyCode = function (req, res) {
    var queryObj = {
        starredUser: req.user.id,
        belongToTask: req.params.taskId
    };
    TaskEvent.findOne(queryObj).exec(function (err, taskEvent) {
        if (err) {
            return res.status(200).send({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        }
        if (!taskEvent) {
            return res.status(200).send(statusCode.TASK_NOT_STARRED);
        }
        if (taskEvent.taskIsDeleted) {
            return res.status(200).send(statusCode.TASK_NOT_EXIST);
        }
        if (taskEvent.status !== 'unfinished') {
            return res.status(200).send(statusCode.TASK_ARCHIVED);
        }
        return res.jsonp({
            statusCode: statusCode.SUCCESS.statusCode,
            verifyCode: taskEvent.verifyCode
        });
    });
};
/**
 * 验证任务列表中的验证码
 * 传入3个参数值（任务点，User的验证码，callback)
 * @param callback 四个值（err信息,验证结果，taskList所属人，错误/正确信息）
 */
var authBonusPermission = function (task, verifyCode, callback) {
    if (task.quota - task.finishedUserCount <= 0) {
        callback(null, false, null, '剩余任务配额不足！');
    }
    else {
        TaskEvent.findOne({'verifyCode': verifyCode, 'isDeleted': {$ne: true}})
            .populate('starredUser', 'displayName')
            .exec(function (err, taskEvent) {
                if (err) {
                    return callback(err);
                }
                if (!taskEvent) {
                    return callback(null, false, null, '请先收藏任务.');
                }
                if (taskEvent.status !== 'unfinished') {
                    return callback(null, false, taskEvent.starredUser.id, '对不起，您已经完成了该任务！');
                }
                return callback(null, true, taskEvent.starredUser.id, '用户【' + taskEvent.starredUser.displayName + '】验证通过！');
            });
    }
};

exports.shareTask = function (req, res) {
    //默认为Android下载链接，如果是iOS设备则改为跳转至app store。
    var downloadLink = config.androidClientDownloadUrl;
    if (req.headers['user-agent'].indexOf('like Mac OS X') !== -1) {
        downloadLink = config.iosClientDownloadUrl;
    }
    res.render('share-task-list/task',
        {
            task: req.task,
            downloadLink: downloadLink
        });
};

/**
 * 商户验证User的用户码
 * @param req
 * @param res
 */
exports.authUser = function (req, res) {
    if (!req.body.verifyCode) {
        return res.jsonp(statusCode.ARGUMENT_REQUIRED);
    }
    req.body.verifyCode = req.body.verifyCode.toUpperCase();
    authBonusPermission(req.task, req.body.verifyCode, function (err, result, belongToUser, message) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        } else {
            if (result === false) {
                return res.status(200).jsonp({
                    statusCode: statusCode.VERIFY_CODE_ERR.statusCode,
                    passed: result,
                    message: message
                });
            } else {
                return res.jsonp({
                    statusCode: statusCode.SUCCESS.statusCode,
                    passed: result,
                    message: message
                });
            }
        }
    });
};

/**
 * 商户发放奖品
 * @param req
 * @param res
 */
exports.finishTask = function (req, res) {
    if (!req.body.verifyCode || !req.body.result) {
        return res.jsonp(statusCode.ARGUMENT_REQUIRED);
    }
    var taskResult = req.body.result === 'success' ? 'success' : 'failed';
    req.body.verifyCode = req.body.verifyCode.toUpperCase();
    async.waterfall([
        function (cb) {
            //验证参与任务的权限。
            authBonusPermission(req.task, req.body.verifyCode, function (err, result, finishedUser, message) {
                if (err) {
                    return res.status(200).jsonp({
                        statusCode: statusCode.DATABASE_ERROR.statusCode,
                        message: err.message
                    });
                } else {
                    if (result === false) {
                        return res.status(200).jsonp({
                            statusCode: statusCode.VERIFY_CODE_ERR.statusCode,
                            message: message
                        });
                    } else {
                        //记录任务中的配额数量和完成情况
                        req.task.finishedUser.push(finishedUser);
                        if (taskResult === 'success') {
                            req.task.successUserCount++;
                        } else {
                            req.task.failedUserCount++;
                        }
                        req.task.finishedUserCount++;
                        req.task.save(function (err) {
                            if (err) {
                                return res.status(200).jsonp({
                                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                                    message: err.message
                                });
                            } else {
                                cb(null, finishedUser);
                            }
                        });
                    }
                }
            });
        },

        function (finishedUser, cb) {
            //更新任务状态
            TaskEvent.findOneAndUpdate({
                starredUser: finishedUser,
                belongToTask: req.task.id
            }, {
                status: req.body.result,
                finishedTime: Date.now()
            }).exec(function (err) {
                if (err) {
                    return res.status(200).jsonp({
                        statusCode: statusCode.DATABASE_ERROR.statusCode,
                        message: err.message
                    });
                } else {
                    var pushMessage = null;
                    if (taskResult === 'success') {
                        pushMessage = '恭喜你已成功完成任务【' + req.task.name + '】！';
                    } else {
                        pushMessage = '很遗憾您的任务【' + req.task.name + '】闯关失败。';
                    }
                    //推送消息。
                    broadcastController.createMessage(null, null, finishedUser, 'Task',
                        req.task.id, req.task.name, pushMessage, true, req.body.result, function (err, result) {
                            if (err) {
                                return res.status(200).jsonp({
                                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                                    message: err.message
                                });
                            } else {
                                cb(null, result, finishedUser);
                            }
                        });
                }
            });
        },
        function (result, finishedUser, cb) {
            BonusController.addTaskBonus(req.task.id, finishedUser, taskResult, function (err, bonusEvent) {
                if (err) {
                    cb(err);
                } else {
                    result.bonus = bonusEvent.bonusChange;
                    cb(null, result);
                }
            });
        }
    ], function (err, result) {
        if (err) {
            return res.jsonp(err);
        }
        res.jsonp(result);
    });

};

/**
 * 管理员增加/减少奖品数量
 * @param req
 * @param res
 */
exports.addQuotaRecord = function (req, res) {

    if (!req.body.quantity) {
        return res.status(200).jsonp({
            statusCode: statusCode.DATABASE_ERROR.statusCode,
            message: 'Enter the quantity !!'
        });
    } else {
        if (req.task.quota + req.body.quantity < 0) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: '填写正确的数量值，不能减少到负数!!'
            });
        }
        var quotaRecorder = {
            date: Date.now(),
            operator: req.user.id,
            quantity: req.body.quantity
        };
        req.task.quota = req.task.quota + req.body.quantity;
        req.task.quotaRecord.addToSet(quotaRecorder);
        req.task.save(function (err, task) {
            if (err) {
                return res.status(200).jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: err.message + 'Add quota record failed!!'
                });
            } else {
                return res.jsonp({
                    statusCode: statusCode.SUCCESS.statusCode,
                    quota: task.quota,
                    restQuota: task.quota - task.finishedUserCount
                });
            }
        });
    }
};

/**
 * 管理员查看奖品操作记录
 * @param req
 * @param res
 */
exports.getQuotaRecord = function (req, res) {

    Task.findOne({'_id': req.task.id}).populate([
        {
            path: 'quotaRecord.operator',
            select: {
                '_id': 1,
                'username': 1,
                'displayName': 1,
                'avatarUrl': 1,
                'gender': 1
            }
        }
    ]).exec(function (err, task) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: 'Add quota record failed!!'
            });
        } else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                quotaRecord: task.quotaRecord
            });
        }
    });
};

/*
 *根据执行地位置刷新任务坐标，鉴于业务的规模，目前只支持刷新100个
 */
exports.refreshTaskLocation = function (req, res) {
    Task.find({isActivity: {$ne: true}}).limit(100).exec(function (err, tasks) {
        if (err) {
            return res.jsonp(statusCode.DATABASE_ERROR);
        }
        var count = 0;
        async.whilst(
            function () {
                return count < tasks.length;
            },
            function (callback) {
                ScenicSpot.findById(tasks[count].belongToScenicSpot).exec(function (err, scenicSpot) {
                    if (err) {
                        return res.jsonp(statusCode.DATABASE_ERROR);
                    }
                    tasks[count].location = scenicSpot.geoLocation;
                    tasks[count].save(function (err, task) {
                        if (err) {
                            return res.jsonp(statusCode.DATABASE_ERROR);
                        }
                        count++;
                        callback();
                    });
                });
            },
            function (err, n) {
                if (err) {
                    return res.jsonp(err);
                }
                return res.jsonp({
                    refreshedCount: count
                });
            }
        );
    });
};
/**
 *验证精选任务数量是否
 */
exports.checkSelectedByEditor = function (req, res) {
    Task.count({
        isActivity: {$ne: true},
        selectedByEditor: true,
        isDeleted: {$ne: true}
    }).exec(function (err, tasksCount) {
        if (err) {
            return res.jsonp(statusCode.DATABASE_ERROR);
        } else {
            if (tasksCount >= config.editorSelectedCount) {
                return res.jsonp({
                    statusCode: statusCode.SELECTED_TASK_ENOUGH.statusCode,
                    selectedTasksCount: tasksCount
                });
            } else {
                return res.jsonp({
                    statusCode: statusCode.SUCCESS.statusCode,
                    selectedTasksCount: tasksCount
                });
            }
        }
    });
};

/**
 *精选任务列表
 */
exports.selectedTasksList = function (req, res) {
    Task.find({isActivity: {$ne: true}, selectedByEditor: true, isDeleted: {$ne: true}}, {
        name: 1,
        city: 1,
        area: 1,
        coverUrl: 1,
        bonus: 1,
        quota: 1,
        finishedUserCount: 1,
        successUserCount: 1,
        belongToUser: 1,
        belongToScenicSpot: 1,
        briefInfo: 1,
        starredUser: 1
    })
        .populate('city', 'name')
        .populate('area', 'name')
        .populate('belongToUser', 'displayName')
        .populate('belongToScenicSpot', 'name').exec(function (err, tasks) {
            if (err) {
                return res.jsonp(statusCode.DATABASE_ERROR);
            } else {
                return res.jsonp({
                    statusCode: statusCode.SUCCESS.statusCode,
                    total: tasks.length,
                    tasks: tasks
                });
            }
        });
};

/**
 * 商户通过扫描二维码审核用户任务
 *
 * @param req
 * @param res
 */
exports.finishTaskByQR = function (req, res) {
    if (!req.task || !req.query.verifyCode) {
        return res.jsonp(statusCode.ARGUMENT_REQUIRED);
    }
    if (!req.user || req.user.id !== req.task.belongToUser._id.toString()) {
        User.findOne({_id: req.task.belongToUser.id}, 'username displayName', function (err, tenant) {
            return res.render('qr-auth-task/easy-login', {
                username: tenant.username,
                displayName: tenant.displayName
            });
        });
    } else {
        return res.render('qr-auth-task/auth-task', {
            taskId: req.task.id,
            displayName: req.task.belongToUser.displayName,
            verifyCode: req.query.verifyCode
        });
    }

};

/**
 * Task authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    if (JSON.stringify(req.task.belongToUser.id) !== JSON.stringify(req.user.id)) {
        return res.status(403).jsonp({
            statusCode: statusCode.NOT_AUTHORIZED.statusCode,
            message: 'The Merchant is not authorized'
        });
    }
    next();
};

/**
 * Task middleware
 */
exports.taskByID = function (req, res, next, id) {
    Task.findOne({'_id': id, 'isDeleted': {$ne: true}},
        'belongToScenicSpot belongToUser finishedUser isActivity starredUser successUserCount failedUserCount ' +
        'finishedUserCount starredUserCount picturesCount desc rule bonus pictures coverUrl name quota commentSize ' +
        'servicePeriod quotaRecord province city briefInfo location area selectedByEditor')
        .populate('belongToScenicSpot', 'name address geoLocation')
        .populate('belongToUser', 'displayName')
        .populate('pictures', 'coverUrl pictureMessage')
        .populate('city', 'name')
        .populate('area', 'name')
        .populate('province', 'name')
        .exec(function (err, task) {
            if (err || !task) {
                return res.jsonp({
                    statusCode: statusCode.TASK_NOT_EXIST.statusCode,
                    message: 'task with id ' + id + ' not exist.'
                });
            }
            task.picturesCount = task.pictures.length;
            req.task = task;
            next();
        });
};

/**
 *群发活动任务的JPush
 */
