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
    handled: {
        type: String,
        enum: ['delete-content', 'invalid', 'delete-content-and-user', 'unhandled'],
        default: 'unhandled'
    },
    desc: String,
    created: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('ObjectionReport', ObjectionReportSchema);
