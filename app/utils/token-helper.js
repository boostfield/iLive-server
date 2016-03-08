'use strict';
var config = require('../../config/config'),
    jwt = require('jwt-simple'),
    moment = require('moment');
exports.getNewToken = function (userId) {
    var expire = Date.parse(moment().add(config.token.accessTokenExpireAfterDays, 'd'));
    return jwt.encode({
        uid: userId || '000',
        exp: expire
    }, config.token.jwtSecret, 'HS512');
};

exports.generateGuid = function () {
    return 'xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }).toUpperCase();
};

exports.decodeToken = function (token) {
    return jwt.decode(token, config.token.jwtSecret, true);
};

exports.getRandomString = function (len) {
    len = len ? len : 8;
    var basicChar = 'ABCDEFGHJKMNPQRSTWXYZ23456789';
    var maxPos = basicChar.length;
    var verifyCode = '';
    for (var i = 0; i < len; i++) {
        verifyCode += basicChar.charAt(Math.floor(Math.random() * maxPos));
    }
    return verifyCode;
};
