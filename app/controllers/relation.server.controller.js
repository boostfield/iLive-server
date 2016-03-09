var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    config = require('../../config/config'),
    User = mongoose.model('User'),
    Relation = mongoose.model('Relation'),
    async = require('async'),
    statusCode = require('../utils/status-code');

exports.addFollowing = function (req, res) {
    var follower = req.user.id;
    var following = req.params.userId;
    async.waterfall([
        function (cb) {
            Relation.findOne({follower: follower, following: following}).exec(function (err, relation) {
                if (err) {
                    cb(err);
                } else if (relation) {
                    cb(statusCode.ALREADY_FOLLOWED);
                } else {
                    cb();
                }
            })
        },
        function (cb) {
            User.findByIdAndUpdate(follower, {$inc: {following: 1}}).exec(function (err) {
                if (err) {
                    cb(err);
                } else {
                    cb();
                }
            })
        },
        function (cb) {
            User.findByIdAndUpdate(following, {$inc: {follower: 1}}).exec(function (err) {
                if (err) {
                    cb(err);
                } else {
                    cb();
                }
            })
        },
        function (cb) {
            var relation = new Relation({
                follower: follower,
                following: following,
                created: Date.now()
            });
            relation.save(function (err) {
                if (err) {
                    cb(err);
                } else {
                    cb();
                }
            })
        }
    ], function (err) {
        if (err) {
            return res.jsonp(err);
        } else {
            return res.jsonp(statusCode.SUCCESS);
        }
    })
};

exports.deleteFollowing = function (req, res) {
    var follower = req.user.id;
    var following = req.params.userId;
    async.waterfall([
        function (cb) {
            Relation.findOne({follower: follower, following: following}).exec(function (err, relation) {
                if (err) {
                    cb(err);
                } else if (!relation) {
                    cb(statusCode.NOT_FOLLOWED_YET);
                } else {
                    cb();
                }
            })
        },
        function (cb) {
            User.findByIdAndUpdate(follower, {$inc: {following: -1}}).exec(function (err) {
                if (err) {
                    cb(err);
                } else {
                    cb();
                }
            })
        },
        function (cb) {
            User.findByIdAndUpdate(following, {$inc: {follower: -1}}).exec(function (err) {
                if (err) {
                    cb(err);
                } else {
                    cb();
                }
            })
        },
        function (cb) {

            Relation.remove({follower: follower, following: following}, function (err) {
                if (err) {
                    cb(err);
                } else {
                    cb();
                }
            })
        }
    ], function (err) {
        if (err) {
            return res.jsonp(err);
        } else {
            return res.jsonp(statusCode.SUCCESS);
        }
    })
};

//获取我关注的人的列表
exports.followingList = function (req, res) {
    async.parallel({
            total: function (callback) {
                Relation.count({follower: req.params.userId}, function (err, count) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, count);
                    }
                });
            },
            users: function (callback) {
                var pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
                var pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 0;
                Relation.find({follower: req.params.userId}, {following: 1, _id: 0})
                    .sort('-created')
                    .skip(pageNumber * pageSize)
                    .limit(pageSize)
                    .populate('following', 'displayName _id gender level avatarUrl')
                    .exec(function (err, relations) {
                        if (err) {
                            return callback(err);
                        } else {
                            var users = [];
                            for (index in relations) {
                                users.push(relations[index].following);
                            }
                            callback(null, users)
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
                return res.json({
                    statusCode: statusCode.SUCCESS.statusCode,
                    total: result.total,
                    users: result.users
                });
            }
        }
    );
};

//获取关注我的人的列表。
exports.followerList = function (req, res) {
    async.parallel({
            total: function (callback) {
                Relation.count({following: req.params.userId}, function (err, count) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, count);
                    }
                });
            },
            users: function (callback) {
                var pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
                var pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 0;
                Relation.find({following: req.params.userId}, {follower: 1, _id: 0})
                    .sort('-created')
                    .skip(pageNumber * pageSize)
                    .limit(pageSize)
                    .populate('follower', 'displayName _id gender level avatarUrl')
                    .exec(function (err, relations) {
                        if (err) {
                            callback(err);
                        } else {
                            var users = [];
                            for (index in relations) {
                                users.push(relations[index].follower);
                            }
                            callback(null, users)
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
                return res.json({
                    statusCode: statusCode.SUCCESS.statusCode,
                    total: result.total,
                    users: result.users
                });
            }
        }
    );
};