'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Country Schema
 */
var CountrySchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Please fill Country name',
        trim: true
    },
    description: String,

    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});
CountrySchema.options.toJSON = {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    }
};
mongoose.model('Country', CountrySchema);
