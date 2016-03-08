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
    nodemailer = require('nodemailer'),
    async = require('async'),
    statusCode = require('../../utils/status-code'),
    smsUtil = require('../../utils/third-part.auth'),
    crypto = require('crypto');

/**
 * Forgot for reset password (forgot POST)
 */
exports.forgot = function (req, res, next) {
    async.waterfall([
        // Generate random token
        function (done) {
            crypto.randomBytes(20, function (err, buffer) {
                var token = buffer.toString('hex');
                done(err, token);
            });
        },
        // Lookup user by username
        function (token, done) {
            if (req.body.username) {
                User.findOne({
                    username: req.body.username
                }, '-salt -password', function (err, user) {
                    if (!user) {
                        return res.status(200).send(statusCode.USER_NOT_EXIST);
                    } else if (user.provider !== 'local') {
                        return res.status(200).send({
                            message: 'It seems like you signed up using your ' + user.provider + ' account'
                        });
                    } else {
                        user.resetPasswordToken = token;
                        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                        user.save(function (err) {
                            done(err, token, user);
                        });
                    }
                });
            } else {
                return res.status(200).send({
                    message: 'Username field must not be blank'
                });
            }
        },
        function (token, user, done) {
            res.render('templates/reset-password-email', {
                name: user.displayName,
                appName: config.app.title,
                url: 'http://' + req.headers.host + '/auth/reset/' + token
            }, function (err, emailHTML) {
                done(err, emailHTML, user);
            });
        },
        // If valid email, send reset email using service
        function (emailHTML, user, done) {
            var smtpTransport = nodemailer.createTransport(config.mailer.options);
            var mailOptions = {
                to: user.email,
                from: config.mailer.from,
                subject: 'Password Reset',
                html: emailHTML
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                if (!err) {
                    res.send({
                        message: 'An email has been sent to ' + user.email + ' with further instructions.'
                    });
                }

                done(err);
            });
        }
    ], function (err) {
        if (err) return next(err);
    });
};

/**
 * Reset password GET from email token
 */
exports.validateResetToken = function (req, res) {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, function (err, user) {
        if (!user) {
            return res.redirect('/#!/password/reset/invalid');
        }

        res.redirect('/#!/password/reset/' + req.params.token);
    });
};

/**
 * Reset password POST from email token
 */
exports.reset = function (req, res, next) {
    // Init Variables
    var passwordDetails = req.body;

    async.waterfall([

        function (done) {
            User.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {
                    $gt: Date.now()
                }
            }, function (err, user) {
                if (!err && user) {
                    if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
                        user.password = passwordDetails.newPassword;
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function (err) {
                            if (err) {
                                return res.status(200).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            } else {
                                req.login(user, function (err) {
                                    if (err) {
                                        res.status(200).send(err);
                                    } else {
                                        // Return authenticated user
                                        res.json(user);

                                        done(err, user);
                                    }
                                });
                            }
                        });
                    } else {
                        return res.status(200).send({
                            message: 'Passwords do not match'
                        });
                    }
                } else {
                    return res.status(200).send({
                        message: 'Password reset token is invalid or has expired.'
                    });
                }
            });
        },
        function (user, done) {
            res.render('templates/reset-password-confirm-email', {
                name: user.displayName,
                appName: config.app.title
            }, function (err, emailHTML) {
                done(err, emailHTML, user);
            });
        },
        // If valid email, send reset email using service
        function (emailHTML, user, done) {
            var smtpTransport = nodemailer.createTransport(config.mailer.options);
            var mailOptions = {
                to: user.email,
                from: config.mailer.from,
                subject: 'Your password has been changed',
                html: emailHTML
            };

            smtpTransport.sendMail(mailOptions, function (err) {
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) return next(err);
    });
};

/**
 * 管理员修改password
 */
exports.changePasswordByAdmin = function (req, res) {
    User.findOne({username: req.body.username}, function (err, user) {
        if (!user) {
            return res.status(200).jsonp(statusCode.USER_NOT_EXIST);
        } else if (err) {
            return res.status(200).jsonp({
                statusCode: statusCode.DATABASE_ERROR.statusCode,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            user.password = req.body.newPassword;
            user.save(function (err, user) {
                if (err) {
                    return res.status(200).jsonp({
                        statusCode: statusCode.DATABASE_ERROR.statusCode,
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    return res.jsonp({
                        statusCode: statusCode.SUCCESS.statusCode,
                        message: user.username + ' \'s password has been changed successfully!'
                    });
                }
            });
        }
    });
};

/**
 * 通过短信验证码修改密码
 * @param req
 * @param res
 * @returns {*}
 */
exports.changePasswordBySms = function (req, res) {
    if (!req.body.phone) {
        return res.status(200).send(statusCode.ARGUMENT_ERROR);
    }
    if (!req.body.code || req.body.newPassword.length < 8 || req.body.newPassword.length > 32) {
        return res.status(200).send(statusCode.PASSWORD_INVALID);
    }
    var isNewVersionStatus = false;
    if (req.body.isNewVersionStatus) {
        isNewVersionStatus = true;
    }

    smsUtil.authSms(req.body.phone, req.body.code, 86, req.body.platform, isNewVersionStatus, function (err, status) {
        if (status !== 200 || err) {
            return res.status(200).jsonp(statusCode.SMS_AUTH_ERR);
        } else {
            User.findOne({'$or': [{phoneNumber: req.body.phone}, {username: req.body.phone}]}, function (err, user) {
                if (!user) {
                    return res.status(200).jsonp(statusCode.USER_NOT_EXIST);
                } else if (err) {
                    return res.status(200).jsonp({
                        statusCode: statusCode.DATABASE_ERROR.statusCode,
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    user.password = req.body.newPassword;
                    user.save(function (err) {
                        if (err) {
                            return res.status(200).jsonp({
                                statusCode: statusCode.DATABASE_ERROR.statusCode,
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            return res.jsonp(statusCode.SUCCESS);
                        }
                    });
                }
            });
        }
    });
};
/**
 * Change Password
 */
exports.changePassword = function (req, res) {
    // Init Variables
    var passwordDetails = req.body;
    if (passwordDetails.newPassword !== passwordDetails.verifyPassword) {
        return res.status(200).send(statusCode.PASSWORD_NOT_MATCH);
    }
    if (!passwordDetails.newPassword) {
        return res.status(200).send({
            statusCode: statusCode.ARGUMENT_REQUIRED.statusCode,
            message: 'Please enter a new password'
        });
    }
    User.findById(req.user.id, function (err, user) {
        if (!err && user) {
            if (!user.authenticate(passwordDetails.currentPassword)) {
                return res.status(200).send(statusCode.PASSWORD_INCORRECT);
            }
            user.password = passwordDetails.newPassword;
            user.save(function (err) {
                if (err) {
                    return res.status(200).send({
                        statusCode: statusCode.ARGUMENT_ERROR.statusCode,
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    req.login(user, function (err) {
                        if (err) {
                            return res.status(200).send({
                                statusCode: statusCode.DATABASE_ERROR.statusCode,
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            return res.send(statusCode.SUCCESS);
                        }
                    });
                }
            });
        } else {
            return res.status(200).send(statusCode.USER_NOT_EXIST);
        }
    });

};
