/**
 * Created by wangerbing on 15/12/22.
 */


'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Area Schema
 */
var AreaSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: '请输入区域的名称',
        trim: true
    },
    belongToCity: {
        required: '请选择城市',
        type: Schema.ObjectId,
        ref: 'City'
    },
    createdBy: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now
    }
});
AreaSchema.options.toJSON = {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    }

};
mongoose.model('Area', AreaSchema);
