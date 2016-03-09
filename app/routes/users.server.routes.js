'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function (app) {
    // User Routes
    var users = require('../../app/controllers/users.server.controller');
    // Setting up the users profile api
    app.route('/users/detect-phone-number').get(users.detectPhoneNumber);
    app.route('/users/me').get(users.requiresLogin, users.me);
    app.route('/users/search').get(users.search);
    app.route('/users/:userId([A-Za-z0-9]{24})').get(users.getUserInfo);
    app.route('/users/users-brief-info').post(users.hasAuthorization(['visitor', 'user']), users.getUsersBriefInfoByUsernames);
    app.route('/users').put(users.requiresLogin, users.update);
    app.route('/users').get(users.hasAuthorization(['admin']), users.list);
    app.route('/users/:username([0-9]{11})').get(users.requiresLogin, users.getUserInfoByUsername);

    // Setting up the users password api
    app.route('/users/password').post(users.hasAuthorization(['user', 'admin']), users.changePassword);
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
    app.route('/auth/signout-web').get(users.signout);

    app.route('/auth/qq').get(passport.authenticate('qq'));
    app.route('/auth/qq/callback').get(users.oauthCallback('qq'));

    // Setting the weibo oauth routes
    app.route('/auth/weibo').get(passport.authenticate('weibo'));
    app.route('/auth/weibo/callback').get(users.oauthCallback('weibo'));

    app.route('/auth/3rd-party/login').post(users.thirdPartySignin);

    //administration interface.
    app.route('/change-password-by-admin').post(users.hasAuthorization(['super-admin']), users.changePasswordByAdmin);
    app.route('/add-permission').post(users.hasAuthorization(['super-admin']), users.addPermission);
};
