'use strict';
var config = require('../../config/config'),
    querystring = require('querystring'),
    request = require('request'),
    statusCode = require('./status-code');

/**
 * 短信验证
 * 新版旧版同时可用
 * @param phone 需要验证的电话号码
 * @param authCode 验证码
 * @param zone 区域，非必填
 * @param callback 结果回调。
 * 返回值为响应码。
 */
exports.authSms = function (phone, authCode, zone, platform, isNewVersionStatus, callback) {
    if (!zone) {
        zone = 86;
    }
    var data = querystring.stringify({
        appkey: config.smsService.appkey,
        zone: zone,
        code: authCode,
        phone: phone
    });
    if(isNewVersionStatus){
        data = querystring.stringify({
            appkey: config.smsService.newAppkey,
            zone: zone,
            code: authCode,
            phone: phone
        });
    }
    if (platform === 'Android') {
        if(isNewVersionStatus) {
            data = querystring.stringify({
                appkey: config.smsService.newAppkeyAndroid,
                zone: zone,
                code: authCode,
                phone: phone
            });
        }else {
            data = querystring.stringify({
                appkey: config.smsService.appkeyAndroid,
                zone: zone,
                code: authCode,
                phone: phone
            });
        }
    }
    if(isNewVersionStatus){
        request.post({url: config.smsService.newHost, form: data}, function (err, result) {
            if (err || result === undefined) {
                callback(err, null);
            }
            callback(null, JSON.parse(result.body).status);
        });
    }else{
        request.post({url: config.smsService.host, form: data}, function (err, result) {
            if (err || result === undefined) {
                callback(err, null);
            }
            callback(null, JSON.parse(result.body).status);
        });
    }
};
