'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Comment Schema
 */
var CommentSchema = new Schema({
    fromUser: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    toUser: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    //被回复的评论的Id
    toComment: {
        type: Schema.ObjectId,
        ref: 'Comment'
    },
    content: {
        type: String,
        require: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    originId: {
        type: Schema.ObjectId
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    commentType: {
        type: String,
        enum: ['TaskList', 'Task']
    }
});
CommentSchema.options.toJSON = {
    transform: function (doc, ret) {
        ret.id = ret._id;
        ret.content = ret.content.trim().replace(/\s+/g,' ');
        delete ret._id;
    }
};

mongoose.model('Comment', CommentSchema);
