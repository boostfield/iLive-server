'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Banner Schema
 */
var LivingRecordSchema = new Schema({
    livingRoomName: {
        type: String
    },
    livingRoomId: {
        type:Number,
        required:true
    },
    startTime: {
        type:Date
    },
    endTime: {
        type:Date
    },
    voteTimes: {
        type: Numeber
    },
    lastPeriod: {
        type: Number
    },
    watchTimes: {
        type: Number
    },
    giftValue: {
        type: Number
    }
});

LivingRecordSchema.options.toJSON = {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
};

mongoose.model('LivingRecord', LivingRecordSchema);
