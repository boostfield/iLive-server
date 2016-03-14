'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 直播记录，用来归档直播历史。
 */
var LivingRecordSchema = new Schema({
    hostId:{
        type: Schema.ObjectId,
        ref: 'User'
    },
    livingRoomName: {
        type: String
    },
    livingRoomId: {
        type: Number,
        required: true
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date,
        default: Date.now
    },
    voteTimes: {
        type: Number
    },
    //直播的持续毫秒数
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
