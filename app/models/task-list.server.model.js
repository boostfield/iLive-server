'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Task list Schema
 */
var TaskListSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Please fill Task list name',
        trim: true
    },
    desc: {
        type: String
    },
    city: {
        type: Schema.ObjectId,
        ref: 'City'
    },
    area: {
        type: Schema.ObjectId,
        ref: 'Area'
    },
    created: {
        type: Date,
        default: Date.now
    },
    coverUrl: {
        type: String,
        default: 'default-task-list-cover.png'
    },
    rule: {
        type: String
    },
    createdByUser: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    tasks: [{
        type: Schema.ObjectId,
        ref: 'Task'
    }],
    commentSize: {
        type: Number,
        default: 0
    },
    recommendTime: String,
    starredUser: [{
        type: Schema.ObjectId,
        ref: 'User'
    }],
    starredUserCount: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

TaskListSchema.index({created:-1});
TaskListSchema.options.toJSON = {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
};
mongoose.model('TaskList', TaskListSchema);
