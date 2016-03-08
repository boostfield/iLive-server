'use strict';

var mongoose = require('mongoose'),
    ApiRecord = mongoose.model('ApiRecord');
exports.recordVisit = function (req, res, next) {
    var newRecord = new ApiRecord({
        url: req.path,
        from:req.ip
    });
    newRecord.save();
    next();
};
