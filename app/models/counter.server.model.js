'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Counter schema
 */
var CounterSchema = new Schema({
    _id: {
        type: String,
        default: 'purchaseCounter'
    },
    seq: {
        type: Number,
        default: 0
    }
});
CounterSchema.statics.getNextSequenc = function (counterName, cb) {
    this.findByIdAndUpdate({_id: counterName},
        {$inc: {seq: 1}},
        {
            new: true,
            upsert: true
        },
        function (err, counter) {
            if (err) {
                cb(err);
            } else {
                cb(null, counter.seq);
            }
        });
};

mongoose.model('Counter', CounterSchema);
