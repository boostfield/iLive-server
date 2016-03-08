/**
 * Created by wangerbing on 15/9/22.
 */

'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * quotaRecordSchema Schema
 */
var QuotaRecorderSchema = new Schema({
    fromTenant:{
        type: Schema.ObjectId,
        ref: 'User'
    },
    fromTask:{
        type: Schema.ObjectId,
        ref: 'Task'
    },
    created:{
        type: Date,
        default: Date.now
    },
    quantity:{
        type: Number,
        default: 0
    },
    result:{
        type: String,
        enum: ['unchecked','deny','pass']
    },
    message:String,
    handler:{
        type: Schema.ObjectId,
        ref: 'User'
    },
    handleTime:{
        type: Date,
        default: Date.now
    }
});
QuotaRecorderSchema.options.toJSON = {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
};
mongoose.model('QuotaRecorder', QuotaRecorderSchema);
