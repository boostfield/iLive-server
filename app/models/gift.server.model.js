'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Banner Schema
 */
var GiftSchema = new Schema({
    name: {
        type: String,
        required: 'Please fill gift name',
        trim: true
    },
    cost: {
        type: Number,
        required: 'Please fill the cost.'
    },
    created: {
        type: Date,
        default: Date.now
    },
    coverUrl: String
});

GiftSchema.options.toJSON = {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
};

mongoose.model('Gift', GiftSchema);
