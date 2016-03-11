'use strict';
var config = require('../../config/config'),
    querystring = require('querystring'),
    request = require('request'),
    fs = require('fs'),
    process = require('child_process'),
    async = require('async'),
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
exports.authSms = function (phone, authCode, zone, platform, callback) {
    if (!zone) {
        zone = 86;
    }
    var data = querystring.stringify({
        appkey: config.smsService.appkey,
        zone: zone,
        code: authCode,
        phone: phone
    });
    if (platform === 'Android') {
        data = querystring.stringify({
            appkey: config.smsService.appkeyAndroid,
            zone: zone,
            code: authCode,
            phone: phone
        });
    }
    request.post({url: config.smsService.host, form: data}, function (err, result) {
        if (err || result === undefined) {
            callback(err, null);
        }
        callback(null, JSON.parse(result.body).status);
    });
};

exports.isPhoneNumber = function (phoneNumber) {
    var phonePattern = /^0?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
    return phonePattern.exec(phoneNumber)
};

exports.getTencentSig = function (userName, cb) {
    var generateSigCmd = 'cd sig-tool; ./tls_licence_tools 1 ec_key.pem ' + userName + ' ' + config.tencentSig.expire +
        ' ' + config.tencentSig.sdkAppId + ' ' + config.tencentSig.accountType +
        ' ' + config.tencentSig.sdkAppId + ' ' + userName;
    async.waterfall([
        function (incb) {
            process.exec(generateSigCmd, function (err, stdout, stderr) {
                if (err) {
                    return incb(err);
                } else {
                    incb();
                }
            })
        },
        function (incb) {
            fs.readFile('./sig-tool/' + userName, function (err, sig) {
                if (err) {
                    return incb(err);
                } else {
                    return incb(null, sig);
                }
            });
        }
    ], function (err, sig) {
        if (err) {
            return cb(statusCode.GENERATE_SIG_FAILED);
        } else {
            return cb(null, sig);
        }
    });
};