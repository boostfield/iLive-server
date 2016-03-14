'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Living Room Schema,用来记录当前正在直播的直播间。
 */
var LivingRoomSchema = new Schema({
    livingRoomName: {
        type: String
    },
    livingRoomId: {
        type: Number,
        required: true
    },
    chatRoomId: {
        type: Number,
        required: true
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    lastHeartBeatTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    voteTimes: {
        type: Number,
        default: 0
    },
    lastPeriod: {
        type: Number
    },
    watchTimes: {
        type: Number
    },
    giftValue: {
        type: Number,
        default: 0
    },
    userInRoom: [{
        id: {
            type: Schema.ObjectId,
            ref: 'User'
        },
        avatarUrl: String
    }]
});

LivingRoomSchema.options.toJSON = {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
};

mongoose.model('LivingRoom', LivingRoomSchema);
