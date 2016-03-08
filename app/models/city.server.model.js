'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * City Schema
 */
var CitySchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Please fill City name',
        unique: 'true',
        trim: true
    },
    album: [{
        type: String
    }],
    introduction: String,
    thingsMustDo: [String],
    specialFood: String,
    souvenir: String,
    tips: [String],
    coverUrl: String,
    country: {
        type: Schema.ObjectId,
        ref: 'Country',
        default: '551115cea6ab3f760913b2e5'
    },
    description: String,
    transportation_info: String,
    province: {
        type: Schema.ObjectId,
        ref: 'Province'
    },
    hotRating: {
        type:Number,
        default: 0
    },
    created: {
        type: Date,
        default: Date.now
    }
});
CitySchema.options.toJSON = {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    }

};
mongoose.model('City', CitySchema);
