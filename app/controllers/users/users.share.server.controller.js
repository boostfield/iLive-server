'use strict';

var _ = require('lodash'),
    errorHandler = require('../errors.server.controller.js'),
    config = require('../../../config/config'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    User = mongoose.model('User'),
    Picture = mongoose.model('Picture'),
    ScenicSpot = mongoose.model('ScenicSpot'),
    async = require('async'),
    statusCode = require('../../utils/status-code');

exports.shareScenicSpot = function (req, res) {
    ScenicSpot.findOne({_id: req.params.scenicSpotId, checked: 'pass', isDeleted: {$ne: true}})
        .populate('belongToUser', 'displayName avatarUrl')
        .populate('city', 'name')
        .populate('province', 'name')
        .exec(function (err, scenicSpot) {
            if (err) {
                return res.status(200).jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: errorHandler.getErrorMessage(err)
                });
            } else if (!scenicSpot) {
                return res.status(200).jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: 'The scenic spot does not exist.'
                });
            } else {
                Picture.find({belongToScenicSpot: scenicSpot.id, isDeleted: {$ne: true}})
                    .limit(5)
                    .exec(function (err, pictures) {
                        res.render('share-scenicspot/scenicspot',
                            {
                                pictures: pictures,
                                scenicSpot: scenicSpot
                            }
                        );
                    }
                );
            }
        });
};
