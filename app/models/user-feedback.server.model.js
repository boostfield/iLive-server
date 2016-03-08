'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * User feedback Schema
 */
var UserFeedbackSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
    content: {
        type: String,
        require:'请填写您反馈的内容'
    },
    email: String,
    phoneNumber:String,
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
    checked: {
        type: Boolean,
        default: false
    },
    handler:{
        type: Schema.ObjectId,
        ref: 'User'
    },
    handleTime:{
        type: Date
    },
    treatment:{
        type:String,
        require:'填写你的处理步骤、情况'
    }
});

mongoose.model('UserFeedback', UserFeedbackSchema);
