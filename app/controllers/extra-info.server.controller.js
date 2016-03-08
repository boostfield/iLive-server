'use strict';
var config = require('../../config/config'),
    statusCode = require('../utils/status-code'),
    errorHandler = require('./errors.server.controller');

exports.getUserProtocol = function (req, res) {
    res.render('extra-info/user-protocol');
};
exports.getHelpDoc = function (req, res) {
    res.render('extra-info/help-doc');
};
exports.getBootstrap = function (req, res) {
    res.render('bootstrap-setup');
};

function needUpdate(latestVer, currentVer) {
    var ver1Array = latestVer.split('.');
    var ver2Array = currentVer.split('.');
    var latestNumber = ver1Array[0] * 1000000 + ver1Array[1] * 10000 + ver1Array[2] * 100;
    var currentNumber = ver2Array[0] * 1000000 + ver2Array[1] * 10000 + ver2Array[2] * 100;
    if (latestNumber > currentNumber) {
        return true;
    } else {
        return false;
    }
}

exports.checkUpdate = function (req, res) {
    var versionReg = /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/;
    if (!req.query.version || !versionReg.test(req.query.version)) {
        return res.status(200).jsonp(statusCode.PARSING_ERR);
    }
    if (needUpdate(config.currentClientVersion, req.query.version)) {
        return res.jsonp({
            statusCode: statusCode.SUCCESS.statusCode,
            needUpdate: true,
            currentVersion: req.query.version,
            latestVersion: config.currentClientVersion
        });
    } else {
        return res.jsonp({
            statusCode: statusCode.SUCCESS.statusCode,
            needUpdate: false,
            currentVersion: req.query.version,
            latestVersion: config.currentClientVersion
        });
    }
};

exports.getClientUrl = function (req, res) {
    return res.jsonp({
        statusCode: statusCode.SUCCESS.statusCode,
        appUrl: config.iosClientDownloadUrl
    });
};

exports.getDownloadUrl = function (req, res){
    var downloadLink = config.androidClientDownloadUrl;
    if(req.headers['user-agent'].toLowerCase().indexOf('micromessenger') !== -1){
        return res.render('extra-info/wechat-mask');
    }
    if (req.headers['user-agent'].indexOf('like Mac OS X') !== -1) {
        downloadLink = config.iosClientDownloadUrl;
    }
    return res.redirect(downloadLink);
};
