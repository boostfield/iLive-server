'use strict';
var _ = require('lodash'),
    errorHandler = require('../errors.server.controller.js'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    User = mongoose.model('User'),
    ScenicSpot = mongoose.model('ScenicSpot'),
    Task = mongoose.model('Task'),
    async = require('async'),
    request = require('request'),
    config = require('../../../config/config'),
    statusCode = require('../../utils/status-code'),
    CryptoJS = require('crypto-js');

var NEAR_USER_RADIUS = 2; //单位：千米
var NEAR_SCENICSPOT_RADIUS = 5000;
var EARTH_RADIUS = 6378.100; //赤道长度，千米
var tasksServer = require('../../controllers/tasks.server.controller');
/**
 * 查找指定位置附近的景点。目前返回最近的那个。
 * @param location 位置信息，经纬度数组。
 * @param callback
 */
var findNearByScenicSpot = function (location, options, callback) {
    var pageNumber = options.pageNumber ? options.pageNumber : 0;
    var pageSize = options.pageSize ? options.pageSize : 10;
    ScenicSpot.aggregate([{
        $geoNear: {spherical: true, maxDistance: NEAR_SCENICSPOT_RADIUS, near: location, distanceField: 'distance'}
    },
        {$match: {isDeleted: {$ne: true}, checked: 'pass', isAuthenticatedTenant: true}},
        {$skip: pageNumber * pageSize},
        {$limit: pageSize}
    ])
        .exec(function (err, results) {
            for (var index in results) {
                //弧度转换为距离。
                results[index].distance *= EARTH_RADIUS;
            }
            callback(err, results);
        });
};

/**
 * 通过某个景点（某个景点的location），查找附近的人
 */
exports.myNearByScenicSpot = function (req, res) {
    if (!req.user.currentLocation) {
        return res.jsonp(statusCode.CURRENT_LOCATION_NOT_SET);
    }
    var options = {pageSize: parseInt(req.query.pageSize), pageNumber: parseInt(req.query.pageNumber)};
    findNearByScenicSpot(req.user.currentLocation, options, function (err, result) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        }
        else {
            result = JSON.parse(JSON.stringify(result));
            for (var index in result) {
                //如果景点没有coverUrl，则用album中的一个赋值   。
                if (result[index].hasOwnProperty('album') && result[index].album.length && !result[index].coverUrl) {
                    if (result[index].album) {
                        result[index].coverUrl = result[index].album[0];
                    }
                }
                result[index].id = result[index]._id;
            }
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                total: result.length,
                scenicSpots: result
            });
        }
    });
};

/**
 * 查找指定地点附近的人。
 * @param location 数组形式的坐标，例：[lng,lat]
 */
var findNearbyUser = function (location, options, callback) {
    var pageNumber = options.pageNumber ? parseInt(options.pageNumber) : 0;
    var pageSize = options.pageSize ? parseInt(options.pageSize) : 10;
    User.aggregate([{
        $geoNear: {spherical: true, maxDistance: 1, near: location, distanceField: 'distance'}
    },
        {$skip: pageNumber * pageSize},
        {$limit: pageSize}
    ]).exec(function (err, results) {
        if (err) {
            callback(err);
        } else {
            var nearUsers = [];
            for (var index in results) {
                var user = {};
                //用户之间的距离为千米级别的。精度前端自行修改
                user.distance = results[index].distance * EARTH_RADIUS;
                user.displayName = results[index].displayName;
                user.avatarUrl = results[index].avatarUrl;
                user.gender = results[index].gender;
                user.id = results[index]._id ? results[index]._id : results[index].id;
                if (user.distance < NEAR_USER_RADIUS) {
                    nearUsers.push(user);
                }

            }
            callback(null, nearUsers);
        }
    });
};


/**
 * 查找'我的'附近的人
 * @param req
 * @param res
 */
exports.findNearUser = function (req, res) {
    var options = {};
    options.pageSize = req.query.pageSize ? parseFloat(req.query.pageSize) : 10;
    options.pageNumber = req.query.pageNumber ? parseFloat(req.query.pageNumber) : 0;
    findNearbyUser(req.user.currentLocation, options, function (err, nearUsers) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        } else {
            //排除附近的人中的自己。
            if (nearUsers) {
                nearUsers.shift();
            }
            return res.status(200).jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                total: nearUsers.length,
                nearUsers: nearUsers
            });
        }
    });
};

exports.findNearRestaurantByBaiDu = function (req, res) {
    var pageSize = req.query.pageSize ? req.query.pageSize : 10;
    var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
    var sortName = req.query.sortName ? req.query.sortName : 'default';
    request('http://api.map.baidu.com/place/v2/search?ak=' + config.BaiDu.AK +
        '&output=json&query=美食&page_size=' + pageSize + '&page_num=' + pageNumber +
        '&scope=2&location=' + req.user.currentLocation[1] + ',' + req.user.currentLocation[0] +
        '&radius=2000&filter=cater&sort_name=' + sortName + '&sort_rule=0', function (err, response, body) {
        var jsBody = JSON.parse(body);
        var total = jsBody.total;
        return res.jsonp({
            statusCode: 0,
            total: total,
            restaurant: jsBody.results

        });
    });
};

//计算距离
var getDistance = function (arr1, arr2) {
    var ew1 = arr1[0] * Math.PI / 180;
    var ns1 = arr1[1] * Math.PI / 180;
    var ew2 = arr2[0] * Math.PI / 180;
    var ns2 = arr2[1] * Math.PI / 180;
    var t1 = Math.cos(ns1) * Math.cos(ew1) * Math.cos(ns2) * Math.cos(ew2);
    var t2 = Math.cos(ns1) * Math.sin(ew1) * Math.cos(ns2) * Math.sin(ew2);
    var t3 = Math.sin(ns1) * Math.sin(ns2);
    var distance = EARTH_RADIUS * Math.acos(t1 + t2 + t3);
    return distance;
};

/**
 * 返回指定位置附近的用户，默认返回十条结果，支持分页。
 */
exports.findPeopleAroundByLocation = function (req, res) {
    if (!req.query.lng || !req.query.lat) {
        return res.status(200).jsonp({
            statusCode: statusCode.PARSING_ERR.statusCode,
            message: statusCode.PARSING_ERR.message
        });
    }
    var options = {};
    options.pageSize = parseFloat(req.query.pageSize) ? req.query.pageSize : 10;
    options.pageNumber = parseFloat(req.query.pageNumber) ? req.query.pageNumber : 0;
    var location = [parseFloat(req.query.lng), parseFloat(req.query.lat)];
    findNearbyUser(location, options, function (err, nearUsers) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        } else {
            return res.status(200).jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                total: nearUsers.length,
                nearUsers: nearUsers
            });
        }
    });
};


var distance = function (location1, location2) {
    return (location1[1] - location2[1]) * (location1[1] - location2[1]) + (location1[0] - location2[0]) * (location1[0] - location2[0]);
};

/**
 * 根据用户的请求获取大众点评的美食URL
 * @param location 用户的位置
 * @param req 处理过后的用户请求
 * @returns {string} 大众点评的附近美食URL
 */
var getUrl = function (location, req) {
    var pageSize = req.query.pageSize ? req.query.pageSize : 20;
    var pageNumber = req.query.pageNumber ? req.query.pageNumber : 1;
    var serverUrl = 'http://api.dianping.com/';
    var apiPath = 'v1/business/find_businesses';
    var appkey = config.DianPing.appkey;
    var secret = config.DianPing.secret;

    var param = {};
    param.latitude = location[1];
    param.longitude = location[0];
    param.category = '美食';
    param.limit = pageSize;
    param.page = pageNumber;
    param.radius = 5000;

    var array = [];
    for (var key in param) {
        array.push(key);
    }
    array.sort();

    var paramArray = [];
    paramArray.push(appkey);
    for (var index in array) {
        var i = array[index];
        paramArray.push(i + param[i]);
    }
    paramArray.push(secret);
    var shaSource = paramArray.join('');
    var sign = String(CryptoJS.SHA1(shaSource)).toUpperCase();

    var queryArray = [];
    queryArray.push('appkey=' + appkey);
    queryArray.push('sign=' + sign);
    for (var k in param) {
        queryArray.push(k + '=' + param[k]);
    }
    var queryString = queryArray.join('&');

    var url = serverUrl + apiPath + '?' + queryString;
    return url;
};

/**
 *通过为location查找附近美食。大众点评BY-2bing
 */
exports.findNearRestaurantByDianPing = function (req, res) {
    var Location;
    if (req.query.lng && req.query.lat) {
        Location = [parseFloat(req.query.lng), parseFloat(req.query.lat)];
    } else {
        Location = req.user.currentLocation;
    }
    var url = getUrl(Location, req);
    request(encodeURI(url), function (err, response, body) {
        if (err) {
            return res.jsonp(statusCode.DIANPING_ERROR);
        }
        var jsBody = JSON.parse(body);
        if (!jsBody.businesses) {
            jsBody.businesses = [];
        }
        var restaurants = JSON.parse(JSON.stringify(jsBody.businesses));
        var restaurantsCount = 0;
        async.whilst(function () {
                return restaurantsCount < restaurants.length;
            }, function (callbackRestaurants) {
                restaurants[restaurantsCount].photos = restaurants[restaurantsCount].photo_url;//图片
                restaurants[restaurantsCount].phone = restaurants[restaurantsCount].telephone;//电话
                restaurants[restaurantsCount].name = restaurants[restaurantsCount].name.replace(/\([^\)]*\)/g, '');//姓名
                //avg_price和address; 推荐美食无数据
                restaurants[restaurantsCount].environment_rating = JSON.stringify(restaurants[restaurantsCount].decoration_grade);
                restaurants[restaurantsCount].service_rating = JSON.stringify(restaurants[restaurantsCount].service_grade);
                restaurants[restaurantsCount].product_rating = JSON.stringify(restaurants[restaurantsCount].product_grade);
                restaurants[restaurantsCount].avg_price = JSON.stringify(restaurants[restaurantsCount].avg_price);
                restaurants[restaurantsCount].avg_rating = JSON.stringify(restaurants[restaurantsCount].avg_rating);
                restaurants[restaurantsCount].distance = JSON.stringify(restaurants[restaurantsCount].distance);


                delete restaurants[restaurantsCount].telephone;
                delete restaurants[restaurantsCount].photo_url;
                delete restaurants[restaurantsCount].deal_count;
                delete restaurants[restaurantsCount].deals;
                delete restaurants[restaurantsCount].product_grade;
                delete restaurants[restaurantsCount].decoration_grade;
                delete restaurants[restaurantsCount].service_grade;
                delete restaurants[restaurantsCount].product_score;
                delete restaurants[restaurantsCount].decoration_score;
                delete restaurants[restaurantsCount].service_score;
                delete restaurants[restaurantsCount].review_count;
                delete restaurants[restaurantsCount].rating_img_url;
                delete restaurants[restaurantsCount].rating_s_img_url;
                delete restaurants[restaurantsCount].business_url;
                delete restaurants[restaurantsCount].s_photo_url;
                delete restaurants[restaurantsCount].photo_count;
                delete restaurants[restaurantsCount].photo_list_url;
                delete restaurants[restaurantsCount].has_coupon;
                delete restaurants[restaurantsCount].coupon_id;
                delete restaurants[restaurantsCount].coupon_description;
                delete restaurants[restaurantsCount].coupon_url;
                delete restaurants[restaurantsCount].has_deal;
                delete restaurants[restaurantsCount].has_online_reservation;
                delete restaurants[restaurantsCount].online_reservation_url;
                delete restaurants[restaurantsCount].review_list_url;
                delete restaurants[restaurantsCount].branch_name;
                restaurantsCount++;
                callbackRestaurants();
            },
            function (err) {
                if (err) {
                    return res.jsonp(statusCode.DIANPING_ERROR);
                }
                return res.jsonp({
                    statusCode: 0,
                    total: restaurants.length,
                    restaurant: restaurants
                });
            });
    });
};


/**
 * 通过景点Id，查找附近景点
 */
exports.getNearbyScenicspot = function (req, res) {
    var options = {pageSize: req.query.pageSize, pageNumber: req.query.pageNumber};
    findNearByScenicSpot(req.scenicSpot.geoLocation, options, function (err, result) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        }
        else {
            //剔除景点自身。
            result.shift();
            result = JSON.parse(JSON.stringify(result));
            for (var index in result) {
                result[index].id = result[index]._id;
            }
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                total: result.length,
                scenicSpots: result
            });
        }
    });
};
/**
 * //先找附近scenicSpot,再找tasks;
 * 分页情况：在寻找tasks时候再分页。
 * location = [118,88];   [lng,lat]
 */

var getNearbyTasks = function (reqQuery, reqUser, location, callback) {
    var pageSize = reqQuery.pageSize ? parseInt(reqQuery.pageSize) : 10;
    var pageNumber = reqQuery.pageNumber ? parseInt(reqQuery.pageNumber) : 0;
    //先找附近scenicSpot,再找tasks
    var options = {pageSize: pageSize, pageNumber: pageNumber};
    findNearByScenicSpot(location, options, function (err, result) {
        if (err) {
            callback({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        }
        else {
            var nearbyScenicSpotIds = [];
            for (var index in result) {
                nearbyScenicSpotIds.push(result[index]._id);
            }

            Task.find({belongToScenicSpot: {$in: nearbyScenicSpotIds}, isDeleted: {$ne: true}, isActivity: {$ne: true}}, {
                name: 1,
                coverUrl: 1,
                quota: 1,
                finishedUserCount: 1,
                belongToUser: 1,
                belongToScenicSpot: 1,
                city: 1,
                bonus: 1,
                briefInfo: 1
            })
                .populate('city', 'name')
                .populate('belongToUser', 'displayName')
                .populate('belongToScenicSpot', 'name')
                .sort('-created')
                .exec(function (err, tasks) {
                    if (err) {
                        callback({
                            statusCode: statusCode.DATABASE_ERROR.statusCode,
                            message: err.message
                        });
                    } else {
                        tasks = JSON.parse(JSON.stringify(tasks));
                        for (var index in tasks) {
                            for (var scenicSpotIndex in result)
                                if (JSON.stringify(tasks[index].belongToScenicSpot).indexOf(JSON.stringify(result[scenicSpotIndex]._id)) !== -1) {
                                    tasks[index].distance = (result[scenicSpotIndex].distance * 1000).toFixed(2);
                                }
                        }
                        //根据距离进行排序
                        var compare = function (a, b) {
                            return a.distance - b.distance;
                        };
                        tasks.sort(compare);
                        tasksServer.getTaskArrayStatus(reqUser, tasks, function (err, newTasks) {
                            if (err) {
                                callback(err);
                            } else {
                                callback(err, newTasks, newTasks.length);
                            }
                        });
                    }
                });
        }
    });
};
exports.getNearbyTasks = getNearbyTasks;
exports.getNearbyTasksByScenicSpotId = function (req, res) {
    var targetUserId;
    if (!req.user || !req.user.id) {
        targetUserId = null;
    } else {
        targetUserId = req.user.id;
    }
    getNearbyTasks(req.query, targetUserId, req.scenicSpot.geoLocation, function (err, tasks, tasksCount) {
        if (err) {
            return res.status(200).jsonp(err);
        } else {
            //过滤距离为0.00的task
            var newTasks = _.filter(tasks, function (task) {
                return task.distance !== '0.00';
            });

            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                total: newTasks.length,
                tasks: newTasks
            });
        }
    });

};

exports.updateLocation = function (req, res) {
    var longitude = parseFloat(req.body.longitude);
    var latitude = parseFloat(req.body.latitude);
    if (!(longitude > -180 && longitude < 180 && latitude > -90 && latitude < 90)) {
        return res.jsonp({
            statusCode: statusCode.ARGUMENT_REQUIRED.statusCode,
            message: 'incorrect  longitude or latitude !'
        });
    } else {
        var user = req.user;
        user.updated = Date.now();
        user.currentLocation = [
            longitude,
            latitude
        ];
        user.save(function (err) {
            if (err) {
                return res.status(200).jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                return res.jsonp(statusCode.SUCCESS);
            }
        });
    }
};

