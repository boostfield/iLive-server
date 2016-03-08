/**
 * Created by wangerbing on 15-6-5.
 */

'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Picture message Schema
 */
var PictureSchema = new Schema({
    belongToUser: {
        type: Schema.ObjectId,
        ref: 'User',
        index: true
    },
    //图片所属的地点（景点、任务实施点--商店）
    belongToScenicSpot: {
        type: Schema.ObjectId,
        ref: 'ScenicSpot',
        index: true
    },
    belongToTask: {
        type: Schema.ObjectId,
        ref: 'Task'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    coverUrl: {
        type: String,
        require: true,
        trim: true,
        index: true
    },
    like: [{
        type: Schema.ObjectId,
        ref: 'User'
    }],
    likeCount: {
        type: Number,
        default: 0
    },
    commentSize: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    //user上传自定义图片，添加图片的描述；首页用到
    pictureMessage: {
        type: String
    },
    pictureType: {
        type: String,
        enum: ['system', 'custom'],
        default: 'custom'
    },
    isOnMainPage: {
        type: Boolean,
        default: false
    },
    checked: {
        type: Boolean,
        default: false
    }
});
PictureSchema.options.toJSON = {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    }
};

mongoose.model('Picture', PictureSchema);
