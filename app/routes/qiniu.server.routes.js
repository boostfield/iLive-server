/**
 * Created by Ethan-Wu on 3/3/15.
 */
'use strict';
module.exports = function (app) {
    var users = require('../../app/controllers/users.server.controller');
    var qiniu = require('../../app/controllers/qiniu.server.controller');
    app.route('/qiniu/avatar-upload-token').get(qiniu.getAvatarUploadToken);
    app.route('/uploaded-callback').post(qiniu.saveUserUploadImage);
    app.route('/qiniu/banner-image-upload-token').get(qiniu.getBannerUploadToken);
    app.route('/add-banner-image').post(qiniu.addBannerPicture);
};
