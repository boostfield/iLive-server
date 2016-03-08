'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Province = mongoose.model('Province'),
    City = mongoose.model('City'),
    User = mongoose.model('User'),
    http = require('http'),
    async = require('async'),
    ScenicSpot = mongoose.model('ScenicSpot'),
    plist = require('plist'),
    statusCode = require('../utils/status-code'),
    _ = require('lodash');

/**
 * Create a City
 */
exports.create = function (req, res) {
    var city = new City(req.body);
    city.user = req.user;

    city.save(function (err, city) {
        if (err) {
            return res.status(200).send({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                city: city
            });
        }
    });
};


/**
 * Show the current City
 */
exports.read = function (req, res) {
    res.jsonp({
        statusCode: statusCode.SUCCESS.statusCode,
        city: req.city
    });
};

/**
 * Update a City
 */
exports.update = function (req, res) {
    var city = req.city;
    city = _.extend(city, req.body);

    city.save(function (err, city) {
        if (err) {
            return res.status(200).send({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                city: city
            });
        }
    });
};

/**
 * Delete an City
 */
exports.delete = function (req, res) {
    var city = req.city;

    city.remove(function (err) {
        if (err) {
            return res.status(200).send({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode
            });
        }
    });
};

/**
 * List of Cities
 */
exports.list = function (req, res) {
    async.parallel({
        total: function (callback) {
            City.count(function (err, count) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, count);
                }
            });
        },
        cities: function (callback) {
            var pageSize = req.query.pageSize ? req.query.pageSize : 10;
            var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
            City.find({})
                .populate('province', 'name')
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
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.json({
                statusCode: statusCode.SUCCESS.statusCode,
                total: result.total,
                cities: result.cities
            });
        }
    });
};

exports.getHotCities = function (req, res) {
    var pageSize = req.query.pageSize ? req.query.pageSize : 21;
    var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
    City.find({})
        .sort({hotRating: -1})
        .skip(pageSize * pageNumber)
        .limit(pageSize)
        .exec(function (err, cities) {
            if (err) {
                return res.status(200).send({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp({
                    statusCode: statusCode.SUCCESS.statusCode,
                    cities: cities
                });
            }
        });
};

/**
 * 根据关键字查询城市。
 * @param req
 * @param res
 * @returns {*}
 */
exports.search = function (req, res) {
    if (req.query.keyword === undefined) {
        return res.status(200).send({
            statusCode: statusCode.ARGUMENT_REQUIRED.statusCode,
            message: statusCode.ARGUMENT_REQUIRED.message
        });
    }

    async.parallel({
        total: function (callback) {
            City.count({'name': new RegExp(req.query.keyword)}, function (err, count) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, count);
                }
            });
        },
        cities: function (callback) {

            var pageSize = req.query.pageSize ? req.query.pageSize : 10;
            var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
            City.find({'name': new RegExp(req.query.keyword)})
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
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.json({
                statusCode: statusCode.SUCCESS.statusCode,
                total: result.total,
                cities: result.cities
            });
        }
    });

};

/**
 * City middleware
 */
exports.cityByID = function (req, res, next, id) {
    City.findById(id).populate('user', 'displayName').exec(function (err, city) {
        if (err) {
            return res.jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        }
        if (!city) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: 'The city does not exist!'
            });
        }
        req.city = city;
        next();
    });
};

exports.getCityCascade = function (req, res) {
    var result = {};
    Province.find({}, 'name').exec(function (err, provinces) {
            result.provinces = JSON.parse(JSON.stringify(provinces));
            var provinceCount = 0;
            async.whilst(
                function () {
                    return provinceCount < provinces.length;
                }, function (callback) {
                    City.find({province: provinces[provinceCount].id}, 'name province').exec(function (err, cities) {
                        if (err) {

                            callback(err);
                        } else {
                            if (cities.length !== 0) {
                                result.provinces[provinceCount].cities = JSON.parse(JSON.stringify(cities));
                            }
                        }
                        provinceCount++;
                        callback();
                    });

                }, function (err) {
                    if (err) return res.jsonp({
                        statusCode: statusCode.DATABASE_ERROR.statusCode,
                        message: err.message
                    });
                    if (req.query.dataType === 'plist') {
                        result = plist.build(result);
                        res.write(result);
                        res.end();
                    } else {
                        return res.jsonp({
                            statusCode: statusCode.SUCCESS.statusCode,
                            results: result
                        });
                    }

                }
            );
        }
    )
    ;
}
;

exports.getScenicSpots = function (req, res) {
    async.parallel({
            total: function (callback) {
                ScenicSpot.count({city: req.city._id, isDeleted: {$ne: true}}, function (err, count) {
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
                ScenicSpot.find({city: req.city._id, checked: 'pass', isDeleted: {$ne: true}},{
                    name: 1,
                    city: 1,
                    province: 1,
                    belongToUser: 1,
                    created:1
                })
                    .populate('city', 'name coverUrl')
                    .populate('belongToUser', 'displayName avatarUrl username gender')
                    .populate('province', 'name')
                    .sort('detail_info.hot_rating')
                    .skip(pageSize * pageNumber)
                    .limit(pageSize)
                    .exec(function (err, scenicSpots) {
                        if (!scenicSpots) {
                            scenicSpots = [];
                        }
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, scenicSpots);
                        }
                    });
            }
        },
        function (err, result) {
            if (err) {
                return res.status(200).send({
                    statusCode: statusCode.DATABASE_ERROR.message,
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                return res.jsonp({
                    statusCode: statusCode.SUCCESS.statusCode,
                    total: result.total,
                    scenicSpots: result.scenicSpots
                });
            }
        }
    )
    ;

}
;
/**
 *通过城市Id获取城市下面的景点列表。手机端
 * @param req
 * @param res
 */
exports.getScenicSpotsByMobile = function (req, res) {
    var resultQuery, countQuery;
    if (req.query.type) {
        if (req.query.type === 'manual') {
            resultQuery = ScenicSpot.find({
                city: req.city._id,
                checked: 'pass',
                dataType: 'manual',
                isDeleted: {$ne: true}
            });
            countQuery = ScenicSpot.count({
                city: req.city._id,
                checked: 'pass',
                dataType: 'manual',
                isDeleted: {$ne: true}
            });
        } else if (req.query.type === 'custom') {
            resultQuery = ScenicSpot.find({
                city: req.city._id,
                checked: 'pass',
                dataType: 'custom',
                isDeleted: {$ne: true}
            });
            countQuery = ScenicSpot.count({
                city: req.city._id,
                checked: 'pass',
                dataType: 'custom',
                isDeleted: {$ne: true}
            });

        }
    } else {
        resultQuery = ScenicSpot.find({city: req.city._id, checked: 'pass', isDeleted: {$ne: true}});
        countQuery = ScenicSpot.count({city: req.city._id, checked: 'pass', isDeleted: {$ne: true}});

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
            resultQuery.select('_id location name album coverUrl')
                .sort('detail_info.hot_rating')
                .skip(pageSize * pageNumber)
                .limit(pageSize)
                .exec(function (err, scenicSpots) {
                    if (!scenicSpots) {
                        scenicSpots = [];
                    }
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
                statusCode: statusCode.DATABASE_ERROR.message,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                total: result.total,
                scenicSpots: result.scenicSpots
            });
        }
    });

};
/**
 * City authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    if (req.city.user.id !== req.user.id) {
        return res.status(403).send(statusCode.NOT_AUTHORIZED);
    }
    next();
};

/**
 * 根据城市列表随机返回其中的一张图片。
 * @param cityArray 城市Id的数组
 * @param cb 返回结果的回调（err,pictures）
 */
exports.getRandomPictures = function (cityArray, cb) {
    City.find({_id: {$in: cityArray}}, {album: 1})
        .exec(function (err, cities) {
            if (err) {
                return cb({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: errorHandler.getErrorMessage(err)
                });
            }
            var alternativePictures = [];
            for (var cityIndex in cities) {
                alternativePictures = alternativePictures.concat(cities[cityIndex].album);
            }
            return cb(null, alternativePictures);
        });
};
