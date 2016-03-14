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
    startTime: {
        type: Date
    },
    lastHeartBeatTime:{
        type:Date
    },
    endTime: {
        type: Date
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
