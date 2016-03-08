'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    ScenicArea = mongoose.model('ScenicArea'),
    statusCode = require('../utils/status-code'),
    _ = require('lodash');

/**
 * Create a Scenic area
 */
exports.create = function (req, res) {
    var scenicArea = new ScenicArea(req.body);
    scenicArea.user = req.user;

    scenicArea.save(function (err) {
        if (err) {
            return res.status(200).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(scenicArea);
        }
    });
};

/**
 * Show the current Scenic area
 */
exports.read = function (req, res) {
    res.jsonp({
        statusCode: statusCode.SUCCESS.statusCode,
        scenicArea: req.scenicArea
    });
};

/**
 * Update a Scenic area
 */
exports.update = function (req, res) {
    var scenicArea = req.scenicArea;

    scenicArea = _.extend(scenicArea, req.body);

    scenicArea.save(function (err) {
        if (err) {
            return res.status(200).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(scenicArea);
        }
    });
};

/**
 * Delete an Scenic area
 */
exports.delete = function (req, res) {
    var scenicArea = req.scenicArea;

    scenicArea.remove(function (err) {
        if (err) {
            return res.status(200).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(scenicArea);
        }
    });
};

/**
 * List of Scenic areas
 */
exports.list = function (req, res) {
    ScenicArea.find().sort('-created').exec(function (err, scenicAreas) {
        if (err) {
            console.log(err);
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                scenicAreas: scenicAreas
            });
        }
    });
};

/**
 * Scenic area middleware
 */
exports.scenicAreaByID = function (req, res, next, id) {
    ScenicArea.findById(id)
        .populate('user', 'displayName name avatarUrl gender')
        .populate('cities', 'name coverUrl')
        .exec(function (err, scenicArea) {
            if (err) return next(err);
            if (!scenicArea) return next(new Error('Failed to load Scenic area ' + id));
            req.scenicArea = scenicArea;
            next();
        });
};

/**
 * Scenic area authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    if (req.scenicArea.user.id !== req.user.id) {
        return res.status(403).send('User is not authorized');
    }
    next();
};
