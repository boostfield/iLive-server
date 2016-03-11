'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Gift = mongoose.model('Gift'),
    _ = require('lodash'),
    statusCode = require('../utils/status-code');


/**
 * Create a Banner
 */
exports.create = function (req, res) {
    var gift = new Gift(req.body);

    gift.save(function (err) {
        if (err) {
            return res.status(200).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(gift);
        }
    });
};

/**
 * Show the current Banner
 */
exports.read = function (req, res) {
    res.jsonp({
        statusCode: statusCode.SUCCESS.statusCode,
        gift: req.gift
    });
};

/**
 * Update a Banner
 */
exports.update = function (req, res) {
    var gift = req.banner;

    gift = _.extend(gift, req.body);

    gift.save(function (err) {
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
    var gift = req.gift;

    gift.remove(function (err) {
        if (err) {
            return res.status(200).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(gift);
        }
    });
};

/**
 * List of Banners
 */
exports.list = function (req, res) {
    Gift.find().sort('-created')
        .limited(20)
        .exec(function (err, gifts) {
        if (err) {
            return res.status(200).send({
                statusCode: statusCode.SUCCESS.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                gifts: gifts,
                total: gifts.length
            });
        }
    });
};

/**
 * Banner middleware
 */
exports.giftByID = function (req, res, next, id) {
    Gift.findById(id).exec(function (err, gift) {
        if (err) return next(err);
        if (!gift) return next(new Error('Failed to load Gift ' + id));
        req.gift = gift;
        next();
    });
};
