'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    errorHandler = require('../errors.server.controller'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    User = mongoose.model('User'),
    Task = mongoose.model('Task'),
    config = require('../../../config/config'),
    tokenHelper = require('../../utils/token-helper'),
    https = require('https'),
    rest = require('restler'),
    async = require('async'),
    request = require('request'),
    qiniuController = require('../qiniu.server.controller'),
    statusCode = require('../../utils/status-code');

/**
 * 注册环信接口，将本地的用户系统注册到环信。在注册用户时使用。
 * @param username
 * @param password
 * @param callback
 */
var signUpEaseChat = function (username, password, callback) {
    password = password ? password : username;
    var requestBody = {
        username: username,
        password: password
    };
    request('https://' + config.easemod.signUpUrl + '/' +
        config.easemod.org + '/' + config.easemod.appName + '/users',
        {
            json: true,
            method: 'POST',
            body: requestBody
        },
        function (err, response, body) {
            callback(err, response, body);
        });
};

/**
 * 创建操作员（系统信息录入人员。）的接口，供管理员在web端调用。
 */
exports.createEditor = function (req, res) {
    var user = new User(req.body);
    user.provider = 'local';
    if (!user.displayName) {
        user.displayName = user.username;
    }
    user.guid = tokenHelper.generateGuid();
    user.accessToken = tokenHelper.getNewToken(user.id.toString());
    user.roles = ['user', 'editor'];
    user.save(function (err, user) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        } else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                username: user.username
            });
        }
    });
};
/**
 * 创建操作员（系统信息录入人员。）的接口，供管理员在web端调用。
 */
exports.createTenant = function (req, res) {
    var user = new User(req.body);
    user.provider = 'local';
    if (!user.displayName) {
        user.displayName = user.username;
    }
    user.guid = tokenHelper.generateGuid();
    user.accessToken = tokenHelper.getNewToken(user.id.toString());
    user.roles = ['user', 'tenant'];
    user.save(function (err, user) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        } else {
            return res.jsonp({
                statusCode: statusCode.SUCCESS.statusCode,
                username: user.username
            });
        }
    });
};
/**
 * 供移动端调用的注册接口，会完成以下任务：
 *  生成token
 *  自动添加环信客服为好友
 *  在未设置昵称的情况下把昵称设为 “用户”+用户名的形式，如：用户18513029307
 *  通过该接口创建的用户初始权限为"user"
 */
exports.signUpWithPhone = function (req, res) {
    // For security measurement we remove the roles from the req.body object
    delete req.body.roles;

    // Init Variables
    var user = new User(req.body);

    var checkResult = User.checkArgument(user);
    if (checkResult.statusCode !== 0) {
        return res.status(200).jsonp(checkResult);
    }

    // Add missing user fields
    user.provider = 'local';
    if (!user.username) {
        user.username = user.phoneNumber;
    }
    if (!user.displayName) {
        user.displayName = '用户' +
            Math.floor((Math.random() * 100000000));
    }
    var checkArgumentResult = User.checkArgument(user);
    if (checkArgumentResult.statusCode !== 0) {
        return res.status(200).jsonp(checkArgumentResult);
    }

    user.guid = tokenHelper.generateGuid();
    user.accessToken = tokenHelper.getNewToken(user.id.toString());
    async.waterfall([
            function (cb) {
                user.friends = [];
                //add easemod customer service and feedback service
                user.friends.push({'user': config.easemod.customerServiceId});
                user.friends.push({'user': config.easemod.feedbackServiceId});
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
exports.detectUsername = function (req, res) {
    if (!req.query.username) {
        return res.status(200).jsonp(statusCode.ARGUMENT_REQUIRED);
    }
    User.findOne({username: req.query.username}, function (err, user) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        } else if (!user) {
            return res.jsonp(statusCode.SUCCESS);
        } else {
            User.findUniqueUsername(req.query.username, '0', function (possibleUsername) {
                return res.jsonp(statusCode.USERNAME_TAKEN);
            });
        }
    });
};

/**
 * web端的登录，不涉及jpushId的变更。
 */
exports.signinWeb = function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err || !user) {
            res.status(200).jsonp(info);
        } else {
            // Remove sensitive data before login
            user.password = undefined;
            user.salt = undefined;
            req.login(user, {}, function (err) {
                if (err) {
                    res.status(200).jsonp(err);
                } else {
                    var newToken = tokenHelper.getNewToken(user._id.toString());
                    User.findOne({_id: user._id}, '-__v -salt -friendsCategory -password')
                        .exec(function (err, authenticatedUser) {
                            if (err) {
                                return res.jsonp({
                                    statusCode: statusCode.DATABASE_ERROR.statusCode,
                                    message: err.message
                                });
                            }
                            authenticatedUser.accessToken = newToken;
                            authenticatedUser.save(function (err) {
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
                        });
                }
            });
        }
    })(req, res, next);
};

/**
 * 移动端登录，会自动刷新用户的Token，并重置jpushId。
 */
exports.signIn = function (req, res, next) {
    passport.authenticate('local', function (err, authenticatedUser, info) {
        if (err) {
            res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        }
        if (!authenticatedUser) {
            res.status(200).jsonp({
                statusCode: statusCode.PASSWORD_INCORRECT.statusCode,
                message: info.message
            });
        } else {
            // Remove sensitive data before login
            req.login(authenticatedUser, function (err) {
                if (err) {
                    return res.status(200).jsonp({
                        statusCode: statusCode.DATABASE_ERROR.statusCode,
                        message: err.message
                    });
                } else {
                    var newToken = tokenHelper.getNewToken(authenticatedUser.id);
                    if (req.body.jpushRegistrationId) {
                        authenticatedUser.jpushRegistrationId = req.body.jpushRegistrationId;
                    }
                    authenticatedUser.accessToken = newToken;
                    authenticatedUser.save(function (err) {
                        if (err) {
                            return res.status(200).jsonp({
                                statusCode: statusCode.DATABASE_ERROR.statusCode,
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            res.jsonp({
                                statusCode: statusCode.SUCCESS.statusCode,
                                user: authenticatedUser
                            });
                        }
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
    user.guid = tokenHelper.generateGuid();
    user.provider = userInfo.type;
    user.friends = [];
    user.thirdPartyAccount = [];
    user.thirdPartyAccount.push({
        accountType: userInfo.type,
        accountId: userInfo.uid,
        accountAvatar: userInfo.avatar

    });
    //add easemod customer service and feedback service
    user.friends.push({'user': config.easemod.customerServiceId});
    user.friends.push({'user': config.easemod.feedbackServiceId});

    if (userInfo.avatar) {
        var avatarUrl = 'jpeg/avatar/' + userInfo.uid + '/' + Date.now().toString();
        user.avatarUrl = avatarUrl;
        qiniuController.transferPicFromUrl(userInfo.avatar, avatarUrl, function (err, result) {
            if (err) {
                console.log(err);
            }
        });
    }
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
                var newToken = tokenHelper.getNewToken(user.id);
                if (req.body.jpushRegistrationId) {
                    user.jpushRegistrationId = req.body.jpushRegistrationId;
                }
                user.accessToken = newToken;
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

exports.getNewToken = function (req, res) {
    var newToken = tokenHelper.getNewToken(req.user._id.toString());
    User.findOneAndUpdate({_id: req.user._id}, {$set: {accessToken: newToken}}, function (err) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: err.message
            });
        }
        return res.jsonp({
            statusCode: statusCode.SUCCESS.statusCode,
            newToken: newToken
        });
    });
};

/**
 * Signout with mobile terminal
 */
exports.signout = function (req, res) {
    req.logout();
    res.jsonp({
        statusCode: statusCode.SUCCESS.statusCode,
        message: statusCode.SUCCESS.message
    });
};

/**
 * Signout with web.
 * @param req
 * @param res
 */
exports.signoutWeb = function (req, res) {
    req.logout();
    res.redirect('/');
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


exports.signUpWithWeixin = function (req, res) {
    //TODO
    res.jsonp({body: req.body});
};

exports.removeTenant = function (req, res) {
    Task.findOne({'belongToUser': req.params.userId, 'isDeleted': {$ne: true}}).exec(function (err, task) {
        if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: 'delete user err: find task belong to this user err.'
            });
        } else {
            if (task) {
                return res.status(200).jsonp({
                    statusCode: statusCode.TASK_BOUND.statusCode,
                    task: task
                });
            } else {
                User.remove({'_id': req.params.userId}).exec(function (err) {
                    if (err) {
                        return res.status(200).jsonp({
                            statusCode: statusCode.DATABASE_ERROR.statusCode,
                            message: 'delete user err.'
                        });
                    } else {
                        return res.status(200).jsonp({
                            statusCode: statusCode.SUCCESS.statusCode,
                            message: 'delete user success'
                        });
                    }
                });
            }
        }
    });
};
