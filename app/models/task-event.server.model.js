'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Task event Schema
 */
var TaskEventSchema = new Schema({
    status: {
        type: String,
        default: 'unfinished',
        enum: ['unfinished', 'success', 'failed']
    },
    belongToTask: {
        type: Schema.ObjectId,
        ref: 'Task'
    },
    starredTime: {
        type: Date,
        default: Date.now
    },
    finishedTime: {
        type: Date
    },
    starredUser: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    verifyCode: {
        type: String
    },
    taskIsDeleted: {
        type: Boolean,
        default: false
    },
    starredFromTask: {
        type: Boolean,
        default: false
    },
    starredFromTaskList: {
        type: Boolean,
        default: false
    }
});

mongoose.model('TaskEvent', TaskEventSchema);
