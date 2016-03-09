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

exports.followingList = function (req, res) {
    return res.jsonp({});
};

exports.followerList = function (req, res) {
    return res.jsonp({});
};