'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Province Schema
 */
var PurchaseRankSchema = new Schema({
    _id: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now
    },
    rank: {
        type: Number
    }
});
PurchaseRankSchema.options.toJSON = {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    }
};
mongoose.model('PurchaseRank', PurchaseRankSchema);
