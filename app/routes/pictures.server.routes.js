/**
 * Created by wangerbing on 15-6-5.
 */

'use strict';

module.exports = function (app) {
    var users = require('../../app/controllers/users.server.controller');
    var pictures = require('../../app/controllers/pictures.server.controller');

    app.route('/pictures/:pictureId([A-Za-z0-9]{24})/like')
        .put(users.authToken, users.hasAuthorization(['user']), pictures.likePicture);
    app.route('/pictures/:pictureId([A-Za-z0-9]{24})/cancel-like')
        .put(users.authToken, users.hasAuthorization(['user']), pictures.dislikePicture);
    app.route('/pictures/:pictureId([A-Za-z0-9]{24})/on-main-page')
        .put(users.authToken, pictures.hasAuthorization, pictures.setOnMainPage);
    app.route('/pictures/my-picture-list')
        .get(users.authToken, users.hasAuthorization(['user']), pictures.getMyPictureList);
    app.route('/pictures/:pictureId([A-Za-z0-9]{24})')
        .get(users.authToken, users.hasAuthorization(['user']), pictures.read);
    app.route('/pictures/:pictureId([A-Za-z0-9]{24})/like-user')
        .get(users.authToken, users.hasAuthorization(['user']), pictures.getLikeUser);
    app.route('/pictures/:pictureId([A-Za-z0-9]{24})')
        .delete(users.authToken, pictures.hasAuthorization, pictures.deletePictureWithRes);
    app.route('/pictures/:pictureId([A-Za-z0-9]{24})/delete-task-picture')
        .delete(users.authToken, pictures.hasAuthorization, pictures.deleteTaskPicture);
    app.route('/pictures/:pictureId([A-Za-z0-9]{24})/update-message')
        .put(users.authToken, pictures.hasAuthorization, pictures.updateMessage);
    app.param('pictureId', pictures.pictureByID);
};
