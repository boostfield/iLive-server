'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Scenic spot Schema
 */
var ScenicSpotSchema = new Schema({
    name: {
        type: String,
        required: '请填写执行地名称。',
        trim: true,
        index: true
    },
    location: {
        lng: {
            type: Number,
            default: 0,
            required: '请填写经度信息。'
        },
        lat: {
            type: Number,
            default: 0,
            required: '请填写纬度信息。'
        }
    },
    album: [{
        type: String
    }],
    coverUrl: String,
    address: String,
    telephone: String,
    detail_info: {
        desc: String,
        transportation_info: String
    },
    isAuthenticatedTenant: {
        type:Boolean,
        default:true
    },

    //默认为机器抓取，临时工添加的景点会在此标示为manual，用户添加的为custom
    dataType: {
        type: String,
        enum: ['manual', 'custom'],
        default: 'custom'
    },
    country: {
        type: Schema.ObjectId,
        ref: 'Country',
        default: '551115cea6ab3f760913b2e5'
    },
    checked: {
        type: String,
        enum: ['pass', 'deny', 'unchecked'],
        default:'pass'
    },
    province: {
        type: Schema.ObjectId,
        ref: 'Province'
    },
    city: {
        type: Schema.ObjectId,
        ref: 'City',
        required: '请填写所属城市。'
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    tips: [String],

    //地理坐标信息，以符合mongodb中geoJson的标准。
    geoLocation: {
        index: '2dsphere',
        type: [Number]
    },
    recommandReason: String,
    belongToUser: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    updatedByUser: [{
        type: Schema.ObjectId,
        ref: 'User'
    }],
    voteUser: [{
        type: Schema.ObjectId,
        ref: 'User'
    }],
    voteSize: {
        type: Number,
        default: 0
    },
    checkedByUser: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    commentSize: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    //标示：是否为后台管理员推荐的景点
    isOnMainPage: {
        type: Boolean,
        default: false
    },
    //album 为系统图片，pictures为用户上传的图片
    pictures: [{
        type: Schema.ObjectId,
        ref: 'Picture'
    }]
});
ScenicSpotSchema.pre('save', function (next) {
    if (this.location) {
        this.geoLocation = [this.location.lng, this.location.lat];
    }
    next();
});
ScenicSpotSchema.options.toJSON = {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        if(ret.geoLocation){
            var location = {
                longitude: ret.geoLocation[0],
                latitude:ret.geoLocation[1]
            };
            ret.geoLocation = location;
        }
    }
};
mongoose.model('ScenicSpot', ScenicSpotSchema);
