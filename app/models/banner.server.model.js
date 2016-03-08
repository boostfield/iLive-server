'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Banner Schema
 */
var BannerSchema = new Schema({
    title: {
        type: String,
        default: '',
        required: 'Please fill Banner name',
        trim: true
    },
    subTitle: String,
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    coverUrl: String,
    url: String
});

BannerSchema.options.toJSON = {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
};

mongoose.model('Banner', BannerSchema);
