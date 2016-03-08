'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    TaskEvent = mongoose.model('TaskEvent'),
    Task = mongoose.model('Task'),
    statusCode = require('../utils/status-code'),
    tokenHelper = require('../utils/token-helper'),
    _ = require('lodash');

/**
 * Create a Task event
 */
exports.create = function (req, res) {
    var taskEvent = new TaskEvent(req.body);
    taskEvent.user = req.user;

    taskEvent.save(function (err) {
        if (err) {
            return res.status(200).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.jsonp(taskEvent);
        }
    });
};

/**
 * 收藏任务
 * @param req
 * @param res
 */
exports.starTask = function (req, res) {
    TaskEvent.findOne({starredUser: req.user._id, belongToTask: req.params.taskId}).exec(function (err, taskEvent) {
            if (err) {
                return res.status(200).jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: errorHandler.getErrorMessage(err)
                });
            }
            var incUserNumber = 0;
            if (taskEvent) {
                incUserNumber = taskEvent.starredFromTask ? 0 : 1;
                taskEvent.starredFromTask = true;
            }
            if (!taskEvent) {
                incUserNumber = 1;
                taskEvent = new TaskEvent();
                taskEvent.belongToTask = req.params.taskId;
                taskEvent.starredUser = req.user._id;
                taskEvent.status = 'unfinished';
                taskEvent.starredFromTask = true;
                taskEvent.verifyCode = tokenHelper.getRandomString(8);
            }
            taskEvent.save(function (err, taskEvent) {
                if (err) {
                    return res.status(200).jsonp({
                        statusCode: statusCode.DATABASE_ERROR.statusCode,
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    Task.findByIdAndUpdate(req.params.taskId, {
                        $addToSet: {starredUser: req.user._id},
                        $inc: {starredUserCount: incUserNumber}
                    }).exec(function (err) {
                        if (err) {
                            return res.status(200).jsonp({
                                statusCode: statusCode.DATABASE_ERROR.statusCode,
                                message: err.message
                            });
                        } else {
                            return res.jsonp({
                                statusCode: statusCode.SUCCESS.statusCode,
                                verifyCode: taskEvent.verifyCode
                            });
                        }
                    });
                }
            });
        }
    );
};

exports.unstarTask = function (req, res) {
    if(req.task.isActivity){
        return res.status(200).jsonp(statusCode.UNSTAR_ACTIVITY_TASK_WARNING);
    }
    TaskEvent.findOne({starredUser: req.user._id, belongToTask: req.params.taskId}).exec(function (err, task) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else if (!task) {
            res.status(200).jsonp(statusCode.TASK_NOT_EXIST);
        } else {
            if (task.status !== 'unfinished') {
                return res.status(200).jsonp(statusCode.TASK_ARCHIVED);
            }
            TaskEvent.findOneAndUpdate({
                starredUser: req.user._id,
                belongToTask: req.params.taskId
            }, {
                starredFromTask: false
            }).exec(function (err) {
                Task.findByIdAndUpdate(req.params.taskId, {
                    $pull: {starredUser: req.user._id},
                    $inc: {starredUserCount: -1}
                }).exec(function () {
                    if (err) {
                        return res.status(200).jsonp({
                            statusCode: statusCode.DATABASE_ERROR.statusCode,
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        return res.jsonp(statusCode.SUCCESS);
                    }
                });
            });
        }
    });
};

exports.rateTask = function (req, res) {
    if (typeof parseInt(req.body.rate) !== 'number') {
        return res.status(200).jsonp(statusCode.ARGUMENT_ERROR);
    }
    TaskEvent.findOne({
        starredUser: req.user._id,
        belongToTask: req.params.taskId,
        status: {$ne: 'unfinished'}
    }).exec(function (err, taskEvent) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        }
        if (!taskEvent) {
            return res.status(200).jsonp(statusCode.NOT_AUTHORIZED);
        }
        if (taskEvent.rating) {
            return res.status(200).jsonp(statusCode.TASK_LIST_ALREADY_RATED);
        }
        taskEvent.rating = req.body.rate;
        taskEvent.save(function (err) {
            if (err) {
                return res.status(200).jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: err.message
                });
            } else {
                return res.jsonp(statusCode.SUCCESS);
            }
        });
    });
};

/**
 * Show the current Task event
 */
exports.read = function (req, res) {
    res.jsonp(req.taskEvent);
};

/**
 * Update a Task event
 */
exports.update = function (req, res) {
    var taskEvent = req.taskEvent;

    taskEvent = _.extend(taskEvent, req.body);

    taskEvent.save(function (err) {
        if (err) {
            return res.status(200).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(taskEvent);
        }
    });
};

/**
 * Delete an Task event
 */
exports.delete = function (req, res) {
    var taskEvent = req.taskEvent;

    taskEvent.remove(function (err) {
        if (err) {
            return res.status(200).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(taskEvent);
        }
    });
};

/**
 * List of Task events
 */
exports.list = function (req, res) {
    TaskEvent.find().sort('-created').populate('user', 'displayName').exec(function (err, taskEvents) {
        if (err) {
            return res.status(200).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(taskEvents);
        }
    });
};

/**
 * Task event middleware
 */
exports.taskEventByID = function (req, res, next, id) {
    TaskEvent.findById(id).populate('user', 'displayName').exec(function (err, taskEvent) {
        if (err) return next(err);
        if (!taskEvent) return next(new Error('Failed to load Task event ' + id));
        req.taskEvent = taskEvent;
        next();
    });
};

/**
 * Task event authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    if (req.taskEvent.user.id !== req.user.id) {
        return res.status(403).send('User is not authorized');
    }
    next();
};

/**
 * get task rating;
 */
exports.getRating = function (req, res) {
    TaskEvent.findOne({
        starredUser: req.user._id,
        belongToTask: req.params.taskId
    }).exec(function (err, taskEvent) {
        if (err) {
            return res.status(200).send({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else if (!taskEvent) {
            return res.status(200).jsonp({
                statusCode: statusCode.TASK_NOT_STARRED.statusCode,
                message: 'You have not starred the task'
            });
        } else if (taskEvent.status === 'unfinished') {
            return res.status(200).jsonp({
                statusCode: statusCode.TASK_NOT_RATING.statusCode,
                message: 'You have not finished the task'
            });

        }
        else if (!taskEvent.rating) {
            return res.status(200).jsonp({
                statusCode: statusCode.TASK_NOT_RATING.statusCode,
                message: 'You have not rating the task'
            });
        }
        else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                rate: taskEvent.rating
            });
        }
    });
};
