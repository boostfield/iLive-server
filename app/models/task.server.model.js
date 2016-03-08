'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Task Schema
 */
var TaskSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: '请输入任务名称',
        trim: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    createdByUser: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    desc: String,

    //任务规则
    rule: String,
    belongToScenicSpot: {
        type: Schema.ObjectId,
        ref: 'ScenicSpot',
        required: '请选择对应执行地'
    },
    coverUrl: {
        type: String,
        default: 'default-task.png'
    },
    belongToUser: {
        type: Schema.ObjectId,
        ref: 'User',
        required: '请选择对应商家'
    },
    rating: {
        type: Number,
        default: 0
    },
    bonus: {
        type: String,
        default: '',
        required: '请输入任务奖励',
        trim: true
    },
    finishedUser: [{
        type: Schema.ObjectId,
        ref: 'User'
    }],
    finishedUserCount: {
        type: Number,
        default: 0
    },
    successUserCount: {
        type: Number,
        default: 0
    },
    failedUserCount: {
        type: Number,
        default: 0
    },
    starredUser: [{
        type: Schema.ObjectId,
        ref: 'User'
    }],
    starredUserCount: {
        type: Number,
        default: 0
    },
    quota: Number,
    servicePeriod: {
        type: String
    },
    commentSize: {
        type: Number,
        default: 0
    },
    pictures: [{
        type: Schema.ObjectId,
        ref: 'Picture'
    }],
    picturesCount: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    province: {
        type: Schema.ObjectId,
        ref: 'Province'
    },
    city: {
        type: Schema.ObjectId,
        ref: 'City'
    },
    area: {
        type: Schema.ObjectId,
        ref: 'Area'
    },
    briefInfo: {
        tenantName: {
            type: String
        },
        bonus: {
            type: String
        }
    },
    isActivity: {
        type: Boolean,
        default: false
    },
    location: {
        index: '2dsphere',
        type: [Number]
    },
    selectedByEditor: {
        type: Boolean,
        default: false
    }
});
TaskSchema.options.toJSON = {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        ret.restQuota = ret.quota - ret.successUserCount;
        //删除值为null的属性
        var property;
        for (property in ret) {
            if (ret[property] === null) {
                delete ret[property];
            }
        }
    }
};
mongoose.model('Task', TaskSchema);
