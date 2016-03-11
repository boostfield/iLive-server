'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    statusCode = require('../../app/utils/status-code'),
    User = require('mongoose').model('User');

module.exports = function () {
    // Use local strategy
    passport.use(new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password'
        },
        function (username, password, done) {
            User.findOne({
                username: username
            }, {
                accessToken: 1,
                displayName: 1,
                username: 1,
                gender: 1,
                avatarUrl: 1,
                password: 1,
                tencentSig: 1,
                salt: 1,
                roles: 1
            }).exec(function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, statusCode.USERNAME_NOT_EXIST);
                }
                if (!user.authenticate(password)) {
                    return done(null, false, statusCode.PASSWORD_INCORRECT);
                }
                return done(null, user);
            });
        }
    ));
};
