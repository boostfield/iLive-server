'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Api Record Schema
 */
var ApiRecordSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    method: {
        type: String,
        default: 'GET'
    },
    url: String,
    from: {
        type: String
    },
    visitTimes: {
        type: Number,
        default: 0
    }
});

ApiRecordSchema.options.toJSON = {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    }
};

mongoose.model('ApiRecord', ApiRecordSchema);
