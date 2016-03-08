'use strict';
var passport = require('passport'),
    BearerStrategy = require('passport-http-bearer').Strategy,
    users = require('../../app/controllers/users.server.controller'),
    config = require('../config'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');

module.exports = function () {
    // Use bearer strategy
    passport.use(new BearerStrategy({},
        function (accessToken, done) {
            User.findOne({accessToken: accessToken}, function (err, user) {
                if (err) {
                    return done(err, user);
                }
                if (!user) {
                    return done(null, false);
                }
                return done(null, user);
            });
        }
    ));
};
