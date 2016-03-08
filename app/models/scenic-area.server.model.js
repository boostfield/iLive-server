'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Scenic area Schema
 */
var ScenicAreaSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Please fill Scenic area name',
        trim: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    belongToUser: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    cities: [{
        type: Schema.ObjectId,
        ref: 'City'
    }],
    scenicSpots: [{
        type: Schema.ObjectId,
        ref: 'ScenicSpot'
    }],
    hotRating: String,
    introduction: String
});

mongoose.model('ScenicArea', ScenicAreaSchema);
