/**
 * Created by wangerbing on 15/12/22.
 */

'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    City = mongoose.model('City'),
    User = mongoose.model('User'),
    http = require('http'),
    async = require('async'),
    Area = mongoose.model('Area'),
    plist = require('plist'),
    statusCode = require('../utils/status-code'),
    _ = require('lodash');

/**
 * Create a Area
 */
exports.create = function (req, res) {
    var area = new Area(req.body.area);
    area.createdBy = req.user;
    area.belongToCity = req.body.area.city;
    Area.findOne({name: area.name,belongToCity:req.body.area.city}, function (err, findArea) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        } else if (findArea) {
            return res.jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: '区域名字不能重复！'
            });
        } else {
            area.save(function (err, area) {
                if (err) {
                    return res.status(200).send({
                        statusCode: statusCode.DATABASE_ERROR.statusCode,
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp({
                        statusCode: statusCode.SUCCESS.statusCode,
                        area: area
                    });
                }
            });
        }
    });
};
/**
 * Update a area
 */
exports.update = function (req, res) {
    var area = req.area;
    area.name = req.body.name;
    Area.findOne({name: area.name, _id: {$ne: req.area._id},belongToCity:req.area.belongToCity}, function (err, findArea) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        } else if (findArea) {
            return res.jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: '区域名字不能重复！'
            });
        } else {
            area.save(function (err) {
                if (err) {
                    return res.status(200).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp({
                        statusCode: statusCode.SUCCESS.statusCode,
                        area: area
                    });
                }
            });
        }
    });
};

/**
 * Delete an Area
 */
exports.delete = function (req, res) {
    var area = req.area;
    area.remove(function (err) {
        if (err) {
            return res.status(200).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(statusCode.SUCCESS);

        }
    });
};
/**
 * area middleware
 */
exports.areaByID = function (req, res, next, id) {
    Area.findById(id).exec(function (err, area) {
        if (err) {
            return res.jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        }
        if (!area) return next(new Error('Failed to load area ' + id));
        req.area = area;
        next();
    });
};

/**
 * getAreasByCityId
 */
exports.getAreasByCityId = function (req, res) {
    Area.find({'belongToCity': req.params.cityId}).exec(function (err, areas) {
        if (err) {
            return res.jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                total: areas.length,
                areas: areas
            });
        }

    });
};

