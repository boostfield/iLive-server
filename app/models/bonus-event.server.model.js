'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Bonus event, record the bonus change event.
 */
var BonusEventSchema = new Schema({
    belongToUser: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now
    },

    //Record change of user bonus, positive number is plus, negative number is minus.
    bonusChange: {
        type: Number,
        required: true
    },
    eventType: {
        type: String,
        enum: ['share', 'task', 'admin-bonus', 'system']
    },
    task: {
        type: Schema.ObjectId,
        ref: 'Task'
    },
    taskResult: {
        type: String,
        enum: ['success', 'failed']
    },

    media: {
        type: String,
        enum: ['wechat', 'wechat-friends', 'weibo', 'qq']
    },
    sourceType: {
        type: String,
        enum: ['task', 'task-list','tutorial-finished']
    },
    sourceId: {
        type: Schema.ObjectId
    }

});

BonusEventSchema.options.toJSON = {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
};

mongoose.model('BonusEvent', BonusEventSchema);
