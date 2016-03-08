'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    TaskList = mongoose.model('TaskList'),
    Task = mongoose.model('Task'),
    TaskEvent = mongoose.model('TaskEvent'),
    broadcastController = require('./broadcast-messages.server.controller.js'),
    taskController = require('./tasks.server.controller.js'),
    config = require('../../config/config'),
    statusCode = require('../utils/status-code'),
    async = require('async'),
    Picture = mongoose.model('Picture'),
    Comment = mongoose.model('Comment'),
    User = mongoose.model('User'),
    tokenHelper = require('../utils/token-helper'),
    _ = require('lodash');

/**
 * Create a Task list
 */
exports.create = function (req, res) {
    var taskList = new TaskList(req.body);
    async.waterfall([
        function (cb) {
            Task.find({_id: {$in: taskList.tasks}})
                .populate('belongToScenicSpot', 'city')
                .exec(function (err, tasks) {
                    if (err) {
                        cb(err);
                    } else {
                        var scenicSpotArray = [];
                        for (var index in tasks) {
                            scenicSpotArray.push(tasks[index].belongToScenicSpot);
                        }
                        cb(null);
                    }
                });
        },
        function (cb) {
            taskList.createdByUser = config.liulianAdmin;
            taskList.belongToUser = config.liulianAdmin;
            taskList.save(function (err, taskList) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, taskList.id);
                }
            });
        }
    ], function (err, taskListId) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                taskListId: taskListId
            });
        }
    });
};

/**
 * Show the current Task list
 */
exports.read = function (req, res) {
    var taskArray = [];
    for (var i = 0; i < req.taskList.tasks.length; i++) {
        taskArray.push(req.taskList.tasks[i]);
    }
    Task.find({'_id': {$in: taskArray}},
        {
            'name': 1,
            'rule': 1,
            'belongToScenicSpot': 1,
            'belongToUser': 1,
            'bonus': 1,
            'quota': 1,
            'desc': 1,
            'servicePeriod': 1,
            'coverUrl': 1,
            'starredUser':1,
            'city': 1
        })
        .populate([
            {
                path: 'belongToUser',
                select: {
                    'displayName': 1
                }
            }, {
                path: 'belongToScenicSpot',
                select: {
                    'name': 1,
                    geoLocation: 1,
                    address: 1
                }
            }, {
                path: 'city',
                select: {
                    'name': 1
                }
            }
        ]).exec(function (err, tasks) {
            if (err) {
                return res.status(200).jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: err.message
                });
            } else {
                var taskList = JSON.parse(JSON.stringify(req.taskList));
                if (req.user) {
                    if (taskList.starredUser && taskList.starredUser.indexOf(req.user.id) !== -1) {
                        taskList.status = 'starred';
                    }
                    delete taskList.starredUser;
                    tasks = JSON.parse(JSON.stringify(tasks));
                    taskController.getTaskArrayStatus(req.user.id, tasks, function (err, tasks) {
                        taskList.tasks = tasks;
                        res.jsonp({
                            statusCode: statusCode.SUCCESS.statusCode,
                            taskList: taskList
                        });
                    });
                } else {
                    taskList.tasks = tasks;
                    res.jsonp({
                        statusCode: statusCode.SUCCESS.statusCode,
                        taskList: taskList
                    });
                }
            }
        });
};

/**
 * Update a Task list
 */
exports.update = function (req, res) {
    var taskList = req.taskList;
    taskList = _.extend(taskList, req.body);
    taskList.save(function (err, taskList) {
        if (err) {
            return res.status(200).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var notificationContent = '您收藏的玩鲜线路：' + taskList.name + '有改动，请点击查看。';
            broadcastController.createMessage(taskList.starredUser, taskList.id, null, 'TaskList', taskList.id, taskList.name, notificationContent, true, 'update', function (err, result) {
                if (err) {
                    return res.status(200).jsonp(err);
                } else {
                    return res.jsonp(result);
                }
            });
        }
    });
};

/**
 * Delete an Task list
 */
exports.delete = function (req, res) {
    async.parallel([
            function (cb) {
                Comment.update({'originId': req.params.taskListId}, {$set: {'isDeleted': true}}).exec(function (err) {
                    if (err) {
                        cb(err);
                    } else {
                        cb();
                    }
                });
            },
            function (cb) {
                TaskList.findOneAndUpdate({'_id': req.params.taskListId}, {$set: {'isDeleted': true}}).exec(function (err, taskList) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, taskList);
                    }
                });
            },
            function (taskList, cb) {
                var notificationContent = '您收藏的玩鲜线路：' + taskList.name + '已下架';
                broadcastController.createMessage(taskList.starredUser, req.params.taskListId, null, 'TaskList', req.params.taskListId, taskList.name, notificationContent, true, 'delete', function (err) {
                    if (err) {
                        cb(err);
                    } else {
                        res.jsonp({
                            statusCode: statusCode.SUCCESS.statusCode
                        });
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
                res.jsonp({
                    statusCode: statusCode.SUCCESS.statusCode
                });
            }
        }
    );
};

/**
 * List of Task lists
 */
exports.list = function (req, res) {
    var queryObject = {isDeleted: {$ne: true}};
    if (req.params.userId) {
        queryObject.starredUser = req.params.userId;
    }
    if (req.query.city) {
        queryObject.city = req.query.city;
    }
    if (req.query.containTask) {
        queryObject.tasks = req.query.containTask;
    }
    if (req.query.keyword) {
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
    }
    async.parallel({
        total: function (callback) {
            TaskList.count(queryObject, function (err, count) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, count);
                }
            });
        },
        taskLists: function (callback) {
            var pageSize = req.query.pageSize ? req.query.pageSize : 10;
            var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
            TaskList.find(queryObject, {name: 1, coverUrl: 1, city: 1, starredUser: 1})
                .populate('city', 'name')
                .sort({created: -1})
                .skip(pageSize * pageNumber)
                .limit(pageSize)
                .exec(function (err, taskLists) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, taskLists);
                    }
                });
        }
    }, function (err, result) {
        if (err) {
            return res.status(200).send({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        } else {
            if (req.user) {
                result.taskLists = JSON.parse(JSON.stringify(result.taskLists));
                for (var index in result.taskLists) {
                    if (result.taskLists[index].starredUser && result.taskLists[index].starredUser.indexOf(req.user.id) !== -1) {
                        result.taskLists[index].status = 'starred';
                    }
                    delete result.taskLists[index].starredUser;
                }
            }
            return res.json({
                statusCode: statusCode.SUCCESS.statusCode,
                total: result.total,
                taskLists: result.taskLists
            });
        }
    });
};

exports.share = function (req, res) {    //默认为Android下载链接，如果是iOS设备则改为跳转至app store。
    var downloadLink = config.androidClientDownloadUrl;
    if(req.headers['user-agent'].indexOf('like Mac OS X') !== -1){
        downloadLink = config.iosClientDownloadUrl;
    }
    Task.find({_id: {$in: req.taskList.tasks}})
        .populate('belongToScenicSpot', 'name coverUrl detail_info.desc')
        .populate('belongToUser', 'displayName')
        .exec(function (err, tasks) {
            if (err) {
                return res.status(200).jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                var wrappedTaskList = JSON.parse(JSON.stringify(req.taskList));
                delete wrappedTaskList.tasks;
                wrappedTaskList.taskBlocks = tasks;
                res.render('share-task-list/task-list',
                    {
                        taskList: wrappedTaskList,
                        downloadLink:downloadLink
                    }
                );

            }
        });
};

exports.starTaskList = function (req, res) {
    if (req.taskList.starredUser.indexOf(req.user._id) !== -1) {
        return res.jsonp(statusCode.SUCCESS);
    }

    //将收藏人添加到玩鲜线路中
    req.taskList.starredUser.unshift(req.user._id);
    req.taskList.starredUserCount++;
    req.taskList.save(function (err) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            async.each(req.taskList.tasks,
                function (task, callback) {
                    var queryObject = {
                        belongToTask: task,
                        starredUser: req.user._id
                    };

                    //如果未收藏任务，则通过线路收藏该任务，如果已通过任务收藏该任务，则仅将通过线路收藏该任务的值设为true。
                    TaskEvent.findOne(queryObject).exec(function (err, taskEvent) {
                        if (err) {
                            callback(err);
                        } else if (!taskEvent) {
                            taskEvent = new TaskEvent();
                            taskEvent.belongToTask = task;
                            taskEvent.starredUser = req.user._id;
                            taskEvent.status = 'unfinished';
                            taskEvent.verifyCode = tokenHelper.getRandomString(8);
                            taskEvent.starredFromTaskList = true;
                            taskEvent.save(function (err) {
                                if (err) {
                                    callback(err);
                                } else {
                                    callback();
                                }
                            });
                        } else {
                            taskEvent.starredFromTaskList = true;
                            taskEvent.save(function (err) {
                                if (err) {
                                    callback(err);
                                } else {
                                    callback();
                                }
                            });
                        }
                    });
                },
                function (err) {
                    if (err) {
                        return res.status(200).jsonp({
                            statusCode: statusCode.TASK_LIST_STARRED_ERROR.statusCode,
                            message: err.message
                        });
                    } else {
                        return res.jsonp(statusCode.SUCCESS);
                    }
                });
        }
    });
};

exports.unstarTaskList = function (req, res) {
    if (req.taskList.starredUser.indexOf(req.user._id) === -1) {
        return res.jsonp(statusCode.SUCCESS);
    }
    TaskList.findByIdAndUpdate(req.taskList.id, {
        $pull: {starredUser: req.user._id},
        $inc: {starredUserCount: -1}
    }, function (err) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.jsonp(statusCode.SUCCESS);
        }
    });
};

exports.getStarredUsers = function (req, res) {
    var pageSize = req.query.pageSize ? req.query.pageSize : 10;
    var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
    var total = req.taskList.starredUser.length;
    var selectedUser = req.taskList.starredUser.reverse().splice(pageNumber * pageSize, pageSize);
    User.find({_id: {$in: selectedUser}}, {
        displayName: 1,
        gender: 1,
        avatarUrl: 1
    }).exec(function (err, users) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                message: err.message
            });
        } else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                total: total,
                users: users
            });
        }
    });
};

/**
 * Task list middleware
 */
exports.taskListByID = function (req, res, next, id) {
    TaskList.findOne({'_id': id, 'isDeleted': {$ne: true}}, {
        name: 1,
        city: 1,
        area: 1,
        desc: 1,
        tasks: 1,
        rule: 1,
        coverUrl: 1,
        commentSize: 1,
        starredUser: 1,
        starredUserCount: 1
    })
        .populate('city', 'name')
        .populate('area', 'name')
        .populate('tasks', 'name belongToScenicSpot belongToUser coverUrl')
        .exec(function (err, taskList) {
            if (err) {
                return res.status(200).jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: errorHandler.getErrorMessage(err)
                });
            }
            if (!taskList) {
                return res.jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: 'The taskList does not exist!'
                });
            }
            req.taskList = taskList;
            next();
        });
};

/**
 * Task list authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    if (JSON.stringify(req.taskList.belongToUser) !== JSON.stringify(req.user.id)) {
        return res.status(403).jsonp({
            statusCode: statusCode.NOT_AUTHORIZED.statusCode,
            message: 'The User is not authorized'
        });
    }
    next();
};
