'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Banner = mongoose.model('Banner'),
    _ = require('lodash'),
    statusCode = require('../utils/status-code');


/**
 * Create a Banner
 */
exports.create = function (req, res) {
    var banner = new Banner(req.body);
    banner.user = req.user;

    banner.save(function (err) {
        if (err) {
            return res.status(200).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(banner);
        }
    });
};

/**
 * Show the current Banner
 */
exports.read = function (req, res) {
    res.jsonp({
        statusCode: statusCode.SUCCESS.statusCode,
        banner: req.banner
    });
};

/**
 * Update a Banner
 */
exports.update = function (req, res) {
    var banner = req.banner;

    banner = _.extend(banner, req.body);

    banner.save(function (err) {
        if (err) {
            return res.status(200).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(banner);
        }
    });
};

/**
 * Delete an Banner
 */
exports.delete = function (req, res) {
    var banner = req.banner;

    banner.remove(function (err) {
        if (err) {
            return res.status(200).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(banner);
        }
    });
};

/**
 * List of Banners
 */
exports.list = function (req, res) {
    Banner.find().sort('-created').exec(function (err, banners) {
        if (err) {
            return res.status(200).send({
                statusCode: statusCode.SUCCESS.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                banners: banners,
                total: banners.length
            });
        }
    });
};

/**
 * Banner middleware
 */
exports.bannerByID = function (req, res, next, id) {
    Banner.findById(id, '-user').exec(function (err, banner) {
        if (err) return next(err);
        if (!banner) return next(new Error('Failed to load Banner ' + id));
        req.banner = banner;
        next();
    });
};
