'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    errorHandler = require('../errors.server.controller'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    User = mongoose.model('User'),
    config = require('../../../config/config'),
    async = require('async'),
    util = require('../../utils/third-part.auth.js'),
    statusCode = require('../../utils/status-code');

/**
 * 供移动端调用的注册接口，会完成以下任务：
 *  生成token
 *  在未设置昵称的情况下把昵称设为 “用户”+用户名的形式，如：用户18513029307
 *  通过该接口创建的用户初始权限为"user"
 */
exports.signUpWithPhone = function (req, res) {
    // 删除注册中的权限信息。
    delete req.body.roles;
    var user = new User(req.body);

    // 默认provider类型为local
    user.provider = 'local';
    if (!user.username) {
        user.username = user.phoneNumber;
    }
    if (!user.displayName) {
        user.displayName = '用户' +
            Math.floor((Math.random() * 100000000));
    }
    var checkResult = User.checkArgument(user);
    if (checkResult.statusCode !== 0) {
        return res.status(200).jsonp(checkResult);
    }

    var checkArgumentResult = User.checkArgument(user);
    if (checkArgumentResult.statusCode !== 0) {
        return res.status(200).jsonp(checkArgumentResult);
    }
    async.waterfall([
            function (cb) {
                user.save(function (err, user) {
                    if (err) {
                        cb({
                            statusCode: statusCode.DATABASE_ERROR.statusCode,
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        // Remove sensitive data before login
                        user.password = undefined;
                        user.salt = undefined;
                        cb(null, user);
                    }
                });
            }
        ],
        function (err, user) {
            if (err) {
                return res.status(200).jsonp(err);
            }
            else {
                return res.jsonp({
                    statusCode: statusCode.SUCCESS.statusCode,
                    user: user
                });
            }
        }
    );
};

/**
 * 检测用户名是否已存在。
 */
exports.detectPhoneNumber = function (req, res) {
    if (!req.query.phoneNumber) {
        return res.status(200).jsonp(statusCode.ARGUMENT_REQUIRED);
    }
    if (!util.isPhoneNumber(req.query.phoneNumber)) {
        return res.jsonp(statusCode.INVALID_PHONE_NUMBER);
    }
    User.findOne({phoneNumber: req.query.phoneNumber}, function (err, user) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        } else if (!user) {
            return res.jsonp(statusCode.SUCCESS);
        } else {
            return res.jsonp(statusCode.PHONE_NUMBER_TAKEN);
        }
    });
};

/**
 * 登录
 */
exports.signIn = function (req, res, next) {
    passport.authenticate('local', function (err, authenticatedUser) {
        if (err) {
            res.jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        } else if (!authenticatedUser) {
            res.status(200).jsonp(statusCode.PASSWORD_INCORRECT);
        } else {
            // Remove sensitive data before login
            req.login(authenticatedUser, function (err) {
                if (err) {
                    return res.status(200).jsonp({
                        statusCode: statusCode.DATABASE_ERROR.statusCode,
                        message: err.message
                    });
                } else {

                    res.jsonp({
                        statusCode: statusCode.SUCCESS.statusCode,
                        user: authenticatedUser
                    });
                }
            });
        }
    })(req, res, next);
};

function createThirdPartyUser(userInfo, cb) {
    var user = new User({
        username: userInfo.uid,
        password: userInfo.uid,
        displayName: userInfo.displayName
    });
    if (!user.displayName) {
        user.displayName = '用户' +
            Math.floor((Math.random() * 100000000));
    }
    user.accessToken = tokenHelper.getNewToken(user.id.toString());
    user.provider = userInfo.type;
    user.thirdPartyAccount = [];
    user.thirdPartyAccount.push({
        accountType: userInfo.type,
        accountId: userInfo.uid,
        accountAvatar: userInfo.avatar

    });
    user.save(function (err, user) {
        if (err) {
            console.log(err);
            cb(err);
        } else {
            // Remove sensitive data before login
            user.password = undefined;
            user.salt = undefined;
            cb(null, user);
        }
    });
}

exports.thirdPartySignin = function (req, res) {
    if (!req.body.type || !req.body.uid) {
        return res.jsonp(statusCode.ARGUMENT_REQUIRED);
    }
    User.findOne({
            'thirdPartyAccount.accountType': req.body.type,
            'thirdPartyAccount.accountId': req.body.uid,
        },
        {
            accessToken: 1,
            displayName: 1,
            username: 1,
            currentLocation: 1,
            gender: 1,
            avatarUrl: 1,
            password: 1,
            salt: 1,
            roles: 1
        }).exec(function (err, user) {
            if (err) {
                return res.jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: err.message
                });
            }
            if (!user) {
                createThirdPartyUser(req.body, function (err, user) {
                    if (err) {
                        return res.jsonp({
                            statusCode: statusCode.DATABASE_ERROR.statusCode,
                            message: err.message
                        });
                    } else {
                        res.jsonp({
                            statusCode: statusCode.SUCCESS.statusCode,
                            user: user
                        });
                    }
                });
            } else {
                if (req.body.jpushRegistrationId) {
                    user.jpushRegistrationId = req.body.jpushRegistrationId;
                }
                user.save(function (err) {
                    if (err) {
                        return res.status(200).jsonp({
                            statusCode: statusCode.DATABASE_ERROR.statusCode,
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp({
                            statusCode: statusCode.SUCCESS.statusCode,
                            user: user
                        });
                    }
                });
            }
        });
};

/**
 * 退出登录。
 */
exports.signout = function (req, res) {
    req.logout();

    //如果是移动端退出则返回json，如果是
    if (req.headers['user-agent'].toLowerCase().indexOf(config.clientUA) !== -1) {
        res.jsonp(statusCode.SUCCESS);
    } else {
        res.redirect('/');
    }
};

/**
 * OAuth callback
 *
 */
exports.oauthCallback = function (strategy) {
    return function (req, res, next) {
        passport.authenticate(strategy, function (err, user, redirectURL) {
            if (err || !user) {
                return res.redirect('/#!/signin');
            }
            req.login(user, function (err) {
                if (err) {
                    return res.redirect('/#!/signin');
                }

                return res.redirect(redirectURL || '/');
            });
        })(req, res, next);
    };
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function (req, providerUserProfile, done) {
    if (!req.user) {
        // Define a search query fields
        var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
        var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

        // Define main provider search query
        var mainProviderSearchQuery = {};
        mainProviderSearchQuery.provider = providerUserProfile.provider;
        mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

        // Define additional provider search query
        var additionalProviderSearchQuery = {};
        additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

        // Define a search query to find existing user with current provider profile
        var searchQuery = {
            $or: [mainProviderSearchQuery, additionalProviderSearchQuery]
        };

        User.findOne(searchQuery, function (err, user) {
            if (err) {
                return done(err);
            } else {
                if (!user) {
                    var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

                    User.findUniqueUsername(possibleUsername, null, function (availableUsername) {
                        user = new User({
                            firstName: providerUserProfile.firstName,
                            lastName: providerUserProfile.lastName,
                            username: availableUsername,
                            displayName: providerUserProfile.displayName,
                            email: providerUserProfile.email,
                            provider: providerUserProfile.provider,
                            providerData: providerUserProfile.providerData
                        });

                        // And save the user
                        user.save(function (err) {
                            return done(err, user);
                        });
                    });
                } else {
                    return done(err, user);
                }
            }
        });
    } else {
        // User is already logged in, join the provider data to the existing user
        var user = req.user;

        // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
        if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
            // Add the provider data to the additional provider data field
            if (!user.additionalProvidersData) user.additionalProvidersData = {};
            user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

            // Then tell mongoose that we've updated the additionalProvidersData field
            user.markModified('additionalProvidersData');

            // And save the user
            user.save(function (err) {
                return done(err, user, '/#!/settings/accounts');
            });
        } else {
            return done(new Error('User is already connected using this provider'), user);
        }
    }
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function (req, res, next) {
    var user = req.user;
    var provider = req.param('provider');

    if (user && provider) {
        // Delete the additional provider
        if (user.additionalProvidersData[provider]) {
            delete user.additionalProvidersData[provider];

            // Then tell mongoose that we've updated the additionalProvidersData field
            user.markModified('additionalProvidersData');
        }

        user.save(function (err) {
            if (err) {
                return res.jsonp({
                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                req.login(user, function (err) {
                    if (err) {
                        res.jsonp(err);
                    } else {
                        res.jsonp(user);
                    }
                });
            }
        });
    }
};
