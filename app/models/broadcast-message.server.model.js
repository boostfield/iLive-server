'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Broadcast message Schema
 */
var BroadcastMessageSchema = new Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    to: [{
        user: {
            type: Schema.ObjectId,
            ref: 'User'
        },
        read: {
            type: Boolean,
            default: false
        }
    }],
    from: {
        type: Schema.ObjectId,
        ref: 'User'
    },

    //赋值为toComment或者toPicture或toScenicSpot或者toPlan的值; 不为toComment的值！
    originId: {
        type: Schema.ObjectId
    },

    content: {
        type: String
    },
    type: {
        type: String,
        enum: ['System', 'Task', 'TaskList']
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});
BroadcastMessageSchema.options.toJSON = {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        ret.read = ret.to.read;
        delete ret.to;
        console.log('exed');
    }
};
mongoose.model('BroadcastMessage', BroadcastMessageSchema);
