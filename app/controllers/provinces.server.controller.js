'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Province = mongoose.model('Province'),
    City = mongoose.model('City'),
    _ = require('lodash'),
    async = require('async'),
    statusCode = require('../utils/status-code'),
    http = require('http');
/**
 * Create a Province
 */
exports.create = function (req, res) {
    var province = new Province(req.body);
    province.user = req.user;

    province.save(function (err) {
        if (err) {
            return res.status(200).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(province);
        }
    });
};


/**
 * Show the current Province
 */
exports.read = function (req, res) {
    res.jsonp(req.province);
};

/**
 * Update a Province
 */
exports.update = function (req, res) {
    var province = req.province;
    province = _.extend(province, req.body);
    province.save(function (err) {
        if (err) {
            return res.status(200).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(province);
        }
    });
};

/**
 * Delete an Province
 */
exports.delete = function (req, res) {
    var province = req.province;
    province.remove(function (err) {
        if (err) {
            return res.status(200).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(province);
        }
    });
};

/**
 * List of Provinces
 */
exports.list = function (req, res) {
    Province.find({}).sort('-created').populate('user', 'displayName').exec(function (err, provinces) {
        if (err) {
            return res.status(200).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(provinces);
        }
    });
};
exports.getCities = function (req, res) {
    async.parallel({
        total: function (callback) {
            City.count({province: req.province._id}, function (err, count) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, count);
                }
            });
        },
        cities: function (callback) {
            var pageSize = req.query.pageSize ? req.query.pageSize : 50;
            var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
            City.find({province: req.province._id})
                .populate('province', 'name coverUrl')
                .skip(pageSize * pageNumber)
                .limit(pageSize)
                .exec(function (err, cities) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, cities);
                    }
                });
        }
    }, function (err, result) {
        if (err) {
            return res.status(200).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.jsonp({
                total: result.total,
                cities: result.cities
            });
        }
    });
};
/**
 * Province middleware
 */
exports.provinceByID = function (req, res, next, id) {
    Province.findById(id).populate('user', 'displayName').exec(function (err, province) {
        if (err) {
            return res.jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        }
        if (!province) return next(new Error('Failed to load Province ' + id));
        req.province = province;
        next();
    });
};

/**
 * Province authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    if (req.province.user.id !== req.user.id) {
        return res.status(403).send('User is not authorized');
    }
    next();
};

//function createByBaiduApi () {
//    var opt = {
//        host: 'api.map.baidu.com',
//        method:'GET',
//        path:'/place/v2/search?ak=A5uGTpd4VFQGsngS9d8kuwdG&output=json&query=景点&page_size=20&page_num=0&scope=2&region=中国'
//    };
//    var body = '';
//    var req = http.request(opt, function(res) {
//        res.on('data',function(d){
//            body += d;
//        }).on('end', function(){
//            var results = JSON.parse(body).results;
//            for(var i = 0; i < results.length; i++) {
//                var province =  new Province({name: results[i].name});
//                province.save( function(err,result) {
//                    if(err){
//                        console.log(err);
//                    } else {
//                    }
//                });
//            }
//        });
//    }).on('error', function(e) {
//        console.log(e.message);
//    });
//    req.end();
//}
