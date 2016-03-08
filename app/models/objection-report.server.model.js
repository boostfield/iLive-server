'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Objection report Schema
 */
var ObjectionReportSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    reporter: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    chargedUser: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    reportType: {
        type: String,
        enum: ['vulgar', 'advertisement', 'political-sensitive',
            'rumor', 'illegal', 'fraud', 'harassment', 'insult', 'others'],
        require: true
    },
    contentId: Schema.ObjectId,
    contentType: {
        type: String,
        enum: ['User','Comment'],
        default:'Comment'
    },
    handled: {
        type: String,
        enum: ['delete-content', 'invalid', 'delete-content-and-user', 'unhandled'],
        default: 'unhandled'
    },
    desc: String
});

mongoose.model('ObjectionReport', ObjectionReportSchema);
