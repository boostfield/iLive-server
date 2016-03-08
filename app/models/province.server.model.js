'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Province Schema
 */
var ProvinceSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Please fill Province name',
        unique: true,
        trim: true
    },
    country: {
        type: Schema.ObjectId,
        ref: 'Country',
        default: '551115cea6ab3f760913b2e5'
    },
    created: {
        type: Date,
        default: Date.now
    }
});
ProvinceSchema.options.toJSON = {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    }
};
mongoose.model('Province', ProvinceSchema);
