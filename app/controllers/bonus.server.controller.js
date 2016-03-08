/**
 * Created by Ethan-Wu on 12/28/15.
 */
/**
 * Created by wangerbing on 15/12/22.
 */

'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    BonusEvent = mongoose.model('BonusEvent'),
    User = mongoose.model('User'),
    async = require('async'),
    _ = require('lodash'),
    statusCode = require('../utils/status-code'),
    bonusConfig = require('../../config/bonus-config');

/**
 *
 * @param taskId:the task finished.
 * @param userId: the user who finished the task.
 * @param result: the execute result of the task.
 * @param ascb async callback.
 */
var addTaskBonus = function (taskId, userId, result, ascb) {
    async.waterfall([
            function (cb) {
                BonusEvent.findOne({belongToUser: userId, task: taskId}).exec(function (err, event) {
                    if (err) {
                        cb({
                            statusCode: statusCode.DATABASE_ERROR.statusCode,
                            message: err.message
                        });
                    } else if (event) {
                        cb({
                            statusCode: statusCode.DATABASE_ERROR.statusCode,
                            message: '你已经完成过了这个任务，不能重复添加积分！'
                        });
                    } else {
                        cb();
                    }
                });
            },
            function (cb) {
                var bonus = result === 'success' ? bonusConfig.taskSuccessPoint : bonusConfig.taskFailedPoint;
                var event = new BonusEvent({
                    belongToUser: userId,
                    task: taskId,
                    result: result,
                    bonusChange: bonus
                });
                event.save(function (err, bonusEvent) {
                    if (err) {
                        cb({
                            statusCode: statusCode.DATABASE_ERROR.statusCode,
                            message: err.message
                        });
                    }
                    cb(null, bonusEvent);
                });
            },
            function (bonusEvent, cb) {
                User.findByIdAndUpdate(userId, {$inc: {bonusPoint: bonusEvent.bonusChange}}, function (err, user) {
                    if (err) {
                        cb({
                            statusCode: statusCode.DATABASE_ERROR.statusCode,
                            message: err.message
                        });
                    } else {
                        cb(null, bonusEvent);
                    }
                });
            }
        ],
        function (err, bonusEvent) {
            if (err) {
                ascb(err);
            } else {
                ascb(null, bonusEvent);
            }
        });
};
exports.addTaskBonus = addTaskBonus;

function addSystemBonus(userId, sourceType, ascb) {
    sourceType = sourceType.toLowerCase();
    var bonus = 0;
    if (sourceType === 'tutorial-finished') {
        bonus = bonusConfig.getStartedTutorialFinished;
    } else {
        return ascb(statusCode.ARGUMENT_ERROR);
    }
    async.waterfall([
            //Check if the bonus been given.
            function (cb) {
                BonusEvent.findOne({belongToUser: userId, sourceType: sourceType})
                    .exec(function (err, event) {
                        if (err) {
                            return cb({
                                statusCode: statusCode.DATABASE_ERROR.statusCode,
                                message: err.message
                            });
                        } else if (event) {
                            cb(statusCode.BONUS_ALREADY_GOT);
                        } else {
                            cb();
                        }
                    });
            },
            //create bonus event.
            function (cb) {
                var bonusEvent = new BonusEvent({
                    belongToUser: userId,
                    eventType: 'system',
                    bonusChange: bonus,
                    sourceType: sourceType
                });
                bonusEvent.save(function (err) {
                    if (err) {
                        return cb({
                            statusCode: statusCode.DATABASE_ERROR.statusCode,
                            message: err.message
                        });
                    } else {
                        cb();
                    }
                });
            },
            //Add bonus to user
            function (cb) {
                User.addBonusPoint(userId, bonus, function (err) {
                    if (err) {
                        return cb({
                            statusCode: statusCode.DATABASE_ERROR.statusCode,
                            message: err.message
                        });
                    } else {
                        cb();
                    }
                });
            }
        ],
        function (err) {
            if (err) {
                return ascb(err);
            } else {
                return ascb(null, bonus);
            }
        }
    );
}

function addShareBonus(userId, media, sourceType, sourceId, ascb) {
    if (!(sourceType && media)) {
        return ascb(statusCode.ARGUMENT_ERROR);
    }
    sourceType = sourceType.toLowerCase();
    async.waterfall([
            //Check if the bonus been given.
            function (cb) {
                BonusEvent.count({belongToUser: userId, eventType: 'share'})
                    .exec(function (err, count) {
                        if (err) {
                            return cb({
                                statusCode: statusCode.DATABASE_ERROR.statusCode,
                                message: err.message
                            });
                        } else if (count < 1) {
                            cb(null, bonusConfig.shareFirstTime);
                        } else if (count < bonusConfig.maxShareBonusTime) {
                            cb(null, bonusConfig.shareManyTime);
                        } else {
                            cb(null, 0);
                        }
                    });
            },
            //create bonus event.
            function (bonus, cb) {
                var bonusEvent = new BonusEvent({
                    belongToUser: userId,
                    eventType: 'share',
                    media: media,
                    sourceType: sourceType,
                    sourceId: sourceId,
                    bonusChange: bonus
                });
                bonusEvent.save(function (err) {
                    if (err) {
                        return cb({
                            statusCode: statusCode.DATABASE_ERROR.statusCode,
                            message: err.message
                        });
                    } else {
                        cb(null, bonus);
                    }
                });
            },
            //Add bonus to user
            function (bonus, cb) {
                User.addBonusPoint(userId, bonus, function (err) {
                    if (err) {
                        return cb({
                            statusCode: statusCode.DATABASE_ERROR.statusCode,
                            message: err.message
                        });
                    } else {
                        cb(null, bonus);
                    }
                });
            }
        ],
        function (err, bonus) {
            if (err) {
                return ascb(err);
            } else {
                return ascb(null, bonus);
            }
        }
    );
}

function addBonus(req, res) {
    switch (req.body.type) {
        case 'system' :
            addSystemBonus(req.user.id, req.body.sourceType, function (err, bonus) {
                if (err) {
                    return res.jsonp(err);
                } else {
                    return res.jsonp({
                        statusCode: statusCode.SUCCESS.statusCode,
                        bonus: bonus
                    });
                }
            });
            break;
        case 'share' :
            addShareBonus(req.user.id, req.body.media, req.body.sourceType, req.body.sourceId,function(err, bonus){
                if (err) {
                    return res.jsonp(err);
                } else {
                    return res.jsonp({
                        statusCode: statusCode.SUCCESS.statusCode,
                        bonus: bonus
                    });
                }
            });
            break;
        default :
            return res.jsonp(statusCode.ARGUMENT_ERROR);
    }
}
exports.addBonus = addBonus;



