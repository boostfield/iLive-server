/**
 * Created by Ethan-Wu on 3/3/15.
 */
'use strict';
module.exports = function (app) {
    var users = require('../../app/controllers/users.server.controller');
    var qiniu = require('../../app/controllers/qiniu.server.controller');
    app.route('/qiniu/upload-token').get(qiniu.getUploadToken);
    app.route('/uploaded-callback').post(qiniu.saveUserUploadImage);
    app.route('/qiniu/city-image-upload-token').get(qiniu.getCityImageUploadToken);
    app.route('/addCityImage').post(qiniu.saveCityImage);
    app.route('/qiniu/scenicspot-image-upload-token').get(qiniu.getScenicSpotUploadToken);
    app.route('/qiniu/banner-image-upload-token').get(qiniu.getBannerUploadToken);
    app.route('/addScenicSpotImage').post(qiniu.saveScenicSpotImage);
    app.route('/add-banner-image').post(qiniu.addBannerPicture);

    //获取上传景点图片的upToken，该token上传图片不会产生图片事件
    app.route('/qiniu/scenicspot-image-upload-token-by-mobile').get(users.authToken, qiniu.getScenicSpotUploadTokenByMobile);

    //创建景点上传图片时的回调。不会产生图片事件。
    app.route('/addScenicSpotImageByMobile').post(qiniu.saveScenicSpotImageByMobile);
    app.route('/qiniu/transfer').post(qiniu.transferPic);

    //获取上传景点图片的upToken，该token上传图片会产生图片事件
    app.route('/qiniu/picture-upload-token').get(users.authToken, qiniu.getPictureUploadToken);

    //创建景点图片的七牛回调接口，会产生图片事件。
    app.route('/addPicture').post(qiniu.addPicture);

    //获取上传任务图片的upToken,后台管理端
    app.route('/qiniu/task-upload-token').get(qiniu.getTaskUploadToken);

    //创建任务图片
    app.route('/addTaskPicture').post(qiniu.addTaskPicture);

    //添加任务清单封面
    app.route('/qiniu/task-list-cover-upload-token').get(qiniu.getTaskListCoverUploadToken);
    app.route('/set-task-list-url').post(qiniu.setTaskListCoverUrl);

};
