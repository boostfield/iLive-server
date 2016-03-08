'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function (app) {
    // User Routes
    var users = require('../../app/controllers/users.server.controller');
    // Setting up the users profile api
    app.route('/users/detect-username').get(users.authToken, users.hasAuthorization(['visitor', 'user']), users.detectUsername);
    app.route('/users/me').get(users.authToken, users.hasAuthorization(['user']), users.me);
    app.route('/users/search').get(users.authToken, users.hasAuthorization(['visitor', 'user']), users.search);
    app.route('/users/:userId([A-Za-z0-9]{24})').get(users.authToken, users.hasAuthorization(['visitor', 'user']), users.getUserInfo);
    app.route('/users/users-brief-info').post(users.authToken, users.hasAuthorization(['visitor', 'user']), users.getUsersBriefInfoByUsernames);
    app.route('/users').put(users.authToken, users.hasAuthorization(['user']), users.update);
    app.route('/users').get(users.authToken, users.hasAuthorization(['visitor', 'user']), users.list);
    app.route('/users/:username([0-9]{11})').get(users.authToken, users.hasAuthorization(['user']), users.getUserInfoByUsername);

    // Setting up the users password api
    app.route('/users/password').post(users.authToken, users.hasAuthorization(['user', 'admin']), users.changePassword);
    app.route('/auth/forgot').post(users.forgot);
    app.route('/auth/reset/:token').get(users.validateResetToken);
    app.route('/auth/reset/:token').post(users.reset);
    app.route('/auth/change-password-by-sms').post(users.changePasswordBySms);

    // Setting up the users authentication api
    app.route('/auth/signup-with-phone').post(users.signUpWithPhone);
    app.route('/auth/signup').post(users.signUpWithPhone);
    app.route('/auth/signin').post(users.signIn);
    app.route('/auth/signin-web').post(users.signinWeb);
    app.route('/auth/signout').get(users.signout);
    app.route('/auth/signout-web').get(users.signoutWeb);
    app.route('/auth/token-expire-time').get(users.authToken, users.hasAuthorization(['user']), users.getTokenExpiredTime);
    app.route('/auth/refresh-token').get(users.authToken, users.hasAuthorization(['user']), users.getNewToken);

    app.route('/auth/qq').get(passport.authenticate('qq'));
    app.route('/auth/qq/callback').get(users.oauthCallback('qq'));

    // Setting the weibo oauth routes
    app.route('/auth/weibo').get(passport.authenticate('weibo'));
    app.route('/auth/weibo/callback').get(users.oauthCallback('weibo'));

    app.route('/auth/3rd-party/login').post(users.thirdPartySignin);

    //administration interface.
    app.route('/change-password-by-admin').post(users.authToken, users.hasAuthorization(['super-admin']), users.changePasswordByAdmin);
    app.route('/add-permission').post(users.authToken, users.hasAuthorization(['super-admin']), users.addPermission);
};
