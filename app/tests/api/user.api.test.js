'use strict';
var should = require('should'),
    request = require('supertest'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    app = require('../../../server'),
    statusCode = require('../../utils/status-code'),
    agent = request(app);

describe('POST /signup', function () {
    it('输入空用户名，注册失败。', function (done) {
        var userInfo = {
            username: '',
            password: 'siyeelikeit'
        };
        agent.post('/auth/signup')
            .send(userInfo)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.statusCode.should.equal(statusCode.USERNAME_EMPTY.statusCode);
                    done();
                }
            });
    });
    it('输入过短的用户名，注册失败。', function (done) {
        var userInfo = {
            username: 'u',
            password: 'siyeelikeit'
        };
        agent.post('/auth/signup')
            .send(userInfo)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.statusCode.should.equal(statusCode.USERNAME_INVALID.statusCode);
                    done();
                }
            });
    });
    it('输入正确用户名，无密码，注册失败。', function (done) {
        var userInfo = {
            username: 'ethanwu',
            password: ''
        };
        agent.post('/auth/signup')
            .send(userInfo)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.statusCode.should.equal(statusCode.PASSWORD_EMPTY.statusCode);
                    done();
                }
            });
    });
    it('输入正确用户名，过短的密码，注册失败。', function (done) {
        var userInfo = {
            username: 'ethanwu',
            password: 'p'
        };
        agent.post('/auth/signup')
            .send(userInfo)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.statusCode.should.equal(statusCode.PASSWORD_INVALID.statusCode);
                    done();
                }
            });
    });
    it('输入合法的用户名和密码，成功注册。', function (done) {
        var userInfo = {
            username: 'ethanwu',
            password: 'siyeelikeit'
        };
        agent.post('/auth/signup')
            .send(userInfo)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.should.have.properties('statusCode','user');
                    res.body.statusCode.should.equal(0);
                    res.body.user.should.have.properties('accessToken','username','displayName','id');
                    res.body.user.username.should.be.equal(userInfo.username);
                    done();
                }
            });
    });
    it('再次注册该用户，注册失败，提示用户名已存在', function (done) {
        var userInfo = {
            username: 'ethanwu',
            password: 'siyeelikeit'
        };
        agent.post('/auth/signup')
            .send(userInfo)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.statusCode.should.equal(90000);
                    done();
                }
            });
    });
    it('输入电话号码，号码不合规范，注册失败。', function (done) {
        var userInfo = {
            username: 'ethanwu3',
            password: 'siyeelikeit',
            phoneNumber: '00000000000'
        };
        agent.post('/auth/signup')
            .send(userInfo)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.statusCode.should.equal(statusCode.INVALID_PHONE_NUMBER.statusCode);
                    done();
                }
            });
    });
    it('输入电话号码，号码合规范，注册成功。', function (done) {
        var userInfo = {
            username: 'ethanwu3',
            password: 'siyeelikeit',
            phoneNumber: '13000000000'
        };
        agent.post('/auth/signup')
            .send(userInfo)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.should.have.properties('statusCode','user');
                    res.body.statusCode.should.equal(0);
                    res.body.user.should.have.properties('username','accessToken','id','phoneNumber');
                    res.body.user.phoneNumber.should.be.equal(userInfo.phoneNumber);
                    done();
                }
            });
    });

    after(function (done) {
        User.remove(function (err) {
            if (err) {
                throw err;
            } else {
                done();
            }
        });
    });
});

describe('GET /users/detect-username', function () {
    it('用户名为空，失败', function (done) {
        agent.get('/users/detect-username?username=')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.should.have.properties('statusCode','message');
                    res.body.statusCode.should.equal(statusCode.ARGUMENT_REQUIRED.statusCode);
                    done();
                }
            });
    });
    it('用户名不存在时，成功', function (done) {
        agent.get('/users/detect-username?username=ethanwu2')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.should.have.properties('statusCode','message');
                    res.body.statusCode.should.be.equal(statusCode.SUCCESS.statusCode);
                    done();
                }
            });
    });

    it('用户名已存在时，返回错误码', function (done) {
        var userInfo = {
            username: 'ethanwu',
            password: 'siyeelikeit'
        };
        var mock = require('../support/mock');
        mock.mockUser(userInfo, function (err, user) {
            if (err) throw err;
            agent.get('/users/detect-username?username=' + userInfo.username)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        res.body.statusCode.should.equal(10001);
                        done();
                    }
                });
        });
    });
    after(function (done) {
        User.remove(function (err) {
            if (err) {
                throw err;
            } else {
                done();
            }
        });
    });
});

describe('POST /auth/signin', function () {
    var userInfo = {
        username: 'ethanwuTestSignin',
        password: 'siyeelikeit'
    };
    before(function (done) {
        var mock = require('../support/mock');
        mock.mockUser(userInfo, function (err, user) {
            if (err) throw err;
            done();
        });
    });

    it('用户名为空时，登陆失败', function (done) {
        agent.post('/auth/signin')
            .send({'username': '', 'password': userInfo.password})
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.statusCode.should.equal(statusCode.PASSWORD_INCORRECT.statusCode);
                    done();
                }
            });
    });
    it('用户名为非注册时，登陆失败', function (done) {
        agent.post('/auth/signin')
            .send({'username': userInfo.username + 'undefined', 'password': userInfo.password})
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.statusCode.should.be.equal(statusCode.PASSWORD_INCORRECT.statusCode);
                    done();
                }
            });
    });
    it('密码为空时，登陆失败', function (done) {
        agent.post('/auth/signin')
            .send({'username': userInfo.username, 'password': ''})
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.statusCode.should.equal(statusCode.PASSWORD_INCORRECT.statusCode);
                    done();
                }
            });
    });
    it('密码错误时，登陆失败', function (done) {
        agent.post('/auth/signin')
            .send({'username': userInfo.username, 'password': userInfo.password + 'undefined'})
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.statusCode.should.equal(statusCode.PASSWORD_INCORRECT.statusCode);
                    done();
                }
            });
    });
    it('用户名、密码正确，登陆成功', function (done) {
        agent.post('/auth/signin')
            .send({'username': userInfo.username, 'password': userInfo.password})
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.should.have.properties('statusCode','user');
                    res.body.statusCode.should.equal(statusCode.SUCCESS.statusCode);
                    res.body.user.should.have.properties('username','id','accessToken');
                    res.body.user.username.should.be.equal(userInfo.username);
                    done();
                }
            });
    });

    after(function (done) {
        User.remove(function (err) {
            if (err) {
                throw err;
            } else {
                done();
            }
        });
    });
});

describe('GET /users/me', function () {
    var userInfo = {
        username: 'ethanwuTestUserMe',
        password: 'siyeelikeit'
    };
    before(function (done) {
        var mock = require('../support/mock');
        mock.mockUser(userInfo, function (err, user) {
            if (err) throw err;
            agent.post('/auth/signin')
                .send(userInfo)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        userInfo.accessToken = res.body.user.accessToken;
                        done();
                    }
                }
            );
        });

    });
    it('用户无accessToken，失败', function (done) {
        agent.get('/users/me?accessToken=')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.statusCode.should.be.equal(statusCode.TOKEN_REQUIRED.statusCode);
                    done();
                }
            });
    });
    it('用户有accessToken，成功', function (done) {
        agent.get('/users/me?accessToken=' + userInfo.accessToken)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.should.have.properties('statusCode','user');
                    res.body.statusCode.should.be.equal(statusCode.SUCCESS.statusCode);
                    res.body.user.should.have.properties('username','id');
                    res.body.user.should.not.have.property('password');
                    done();
                }
            });
    });


    after(function (done) {
        User.remove(function (err) {
            if (err) {
                throw err;
            } else {
                done();
            }
        });
    });
});

describe('PUT /users', function () {
    var userInfo = {
        username: 'ethanwuTestPUTUser',
        password: 'siyeelikeit'
    };
    var userInfo2 = {
        username: 'ethanwuTestPUTUser2',
        password: 'siyeelikeit',
        phoneNumber: '13012345678'
    };
    before(function (done) {
        var mock = require('../support/mock');
        mock.mockUser(userInfo, function (err, user) {
            if (err) throw err;
            mock.mockUser(userInfo2, function (err, user) {
                if (err) throw err;
                agent.post('/auth/signin')
                    .send(userInfo)
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        } else {
                            userInfo.accessToken = res.body.user.accessToken;
                            done();
                        }
                    }
                );
            });
        });

    });
    it('用户更新displayName，无accessToken，失败', function (done) {
        var newDisplayName = 'newDisplayName';
        agent.put('/users?accessToken=')
            .send({'displayName': newDisplayName})
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.statusCode.should.equal(statusCode.TOKEN_REQUIRED.statusCode);
                    done();
                }
            });
    });
    it('用户更新displayName，成功', function (done) {
        var newDisplayName = 'newDisplayName';
        agent.put('/users?accessToken=' + userInfo.accessToken)
            .send({'displayName': newDisplayName})
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.should.have.properties('statusCode','updatedFields');
                    res.body.statusCode.should.equal(statusCode.SUCCESS.statusCode);
                    res.body.updatedFields.displayName.should.be.a.String(newDisplayName);
                    done();
                }
            });
    });
    it('用户更新,错误phoneNumber，失败', function (done) {
        var newPhoneNumber = '1301234567M';
        agent.put('/users?accessToken=' + userInfo.accessToken)
            .send({'phoneNumber': newPhoneNumber})
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.statusCode.should.equal(statusCode.UPDATE_INFO_FAILED.statusCode);
                    done();
                }
            });
    });
    it('用户更新,phoneNumber已经存在，失败', function (done) {
        var newPhoneNumber = '13012345678';
        agent.put('/users?accessToken=' + userInfo.accessToken)
            .send({'phoneNumber': newPhoneNumber})
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.statusCode.should.equal(statusCode.UPDATE_INFO_FAILED.statusCode);
                    done();
                }
            });
    });
    it('用户更新正确phoneNumber，成功', function (done) {
        var newPhoneNumber = '13012345679';
        agent.put('/users?accessToken=' + userInfo.accessToken)
            .send({'phoneNumber': newPhoneNumber})
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.should.have.properties('statusCode','updatedFields');
                    res.body.statusCode.should.equal(statusCode.SUCCESS.statusCode);
                    res.body.updatedFields.phoneNumber.should.be.equal(newPhoneNumber);
                    done();
                }
            });
    });
    it('用户更新非法性别，失败', function (done) {
        var newGender = 'newGender';
        agent.put('/users?accessToken=' + userInfo.accessToken)
            .send({'gender': newGender})
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.statusCode.should.equal(statusCode.UPDATE_INFO_FAILED.statusCode);
                    done();
                }
            });
    });
    it('用户更新性别，成功', function (done) {
        var allGender = ['male', 'female', 'unknown'];
        var newGender = allGender[Math.floor(Math.random() * allGender.length)];
        agent.put('/users?accessToken=' + userInfo.accessToken)
            .send({'gender': newGender})
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.should.have.properties('statusCode','updatedFields');
                    res.body.statusCode.should.equal(statusCode.SUCCESS.statusCode);
                    res.body.updatedFields.gender.should.be.equal(newGender);
                    done();
                }
            });
    });
    it('用户生日为空，成功', function (done) {
        agent.put('/users?accessToken=' + userInfo.accessToken)
            .send({'birthday': ''})
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.statusCode.should.equal(statusCode.SUCCESS.statusCode);
                    done();
                }
            });
    });
    it('用户更新生日，成功', function (done) {
        var newBirthday = Date.now();
        agent.put('/users?accessToken=' + userInfo.accessToken)
            .send({'birthday': newBirthday})
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.should.have.properties('statusCode','updatedFields');
                    res.body.statusCode.should.equal(statusCode.SUCCESS.statusCode);
                    done();
                }
            });
    });


    after(function (done) {
        User.remove(function (err) {
            if (err) {
                throw err;
            } else {
                done();
            }
        });
    });
});

describe('GET /auth/token-expire-time', function () {
    var userInfo = {
        username: 'ethanWuTestTokenExpireTime',
        password: 'siyeeLikeIt'
    };
    before(function (done) {
        var mock = require('../support/mock');
        mock.mockUser(userInfo, function (err, user) {
            if (err) throw err;
            agent.post('/auth/signin')
                .send(userInfo)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        userInfo.accessToken = res.body.user.accessToken;
                        done();
                    }
                }
            );
        });

    });
    it('用户无accessToken，查看Token剩余时间失败', function (done) {
        agent.get('/auth/token-expire-time?accessToken=')
            //.expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.statusCode.should.equal(statusCode.TOKEN_REQUIRED.statusCode);
                    done();
                }
            });
    });
    it('用户有accessToken，查看Token剩余时间成功', function (done) {
        agent.get('/auth/token-expire-time?accessToken=' + userInfo.accessToken)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.should.have.properties('statusCode','expireAfter');
                    res.body.statusCode.should.equal(statusCode.SUCCESS.statusCode);
                    res.body.expireAfter.should.a.Number();
                    done();
                }
            });
    });
    after(function (done) {
        User.remove(function (err) {
            if (err) {
                throw err;
            } else {
                done();
            }
        });
    });
});

describe('GET /auth/refresh-token', function () {
    var userInfo = {
        username: 'ethanWuTestRefreshToken',
        password: 'siyeelikeit'
    };
    before(function (done) {
        var mock = require('../support/mock');
        mock.mockUser(userInfo, function (err, user) {
            if (err) throw err;
            agent.post('/auth/signin')
                .send(userInfo)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        userInfo.accessToken = res.body.user.accessToken;
                        done();
                    }
                }
            );
        });

    });
    it('用户无accessToken，更新Token失败', function (done) {
        agent.get('/auth/refresh-token?accessToken=')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.statusCode.should.equal(statusCode.TOKEN_REQUIRED.statusCode);
                    done();
                }
            });
    });
    it('用户有accessToken，更新Token成功', function (done) {
        agent.get('/auth/refresh-token?accessToken=' + userInfo.accessToken)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.should.have.properties('statusCode','newToken');
                    res.body.statusCode.should.equal(statusCode.SUCCESS.statusCode);
                    res.body.newToken.should.be.a.String();
                    res.body.newToken.should.be.type('string');
                    done();
                }
            });
    });


    after(function (done) {
        User.remove(function (err) {
            if (err) {
                throw err;
            } else {
                done();
            }
        });
    });
});

describe('POST /users/password', function () {
    var userInfo = {
        username: 'ethanWuTestPassword',
        password: 'siyeelikeit'
    };
    before(function (done) {
        var mock = require('../support/mock');
        mock.mockUser(userInfo, function (err, user) {
            if (err) throw err;
            agent.post('/auth/signin')
                .send(userInfo)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        userInfo.accessToken = res.body.user.accessToken;
                        done();
                    }
                }
            );
        });

    });
    it('用户有accessToken，现有密码错误，更新失败', function (done) {
        var newPassword = 'newPassword';
        var verifyPassword = newPassword;
        agent.post('/users/password?accessToken=' + userInfo.accessToken)
            .send({
                'currentPassword': userInfo.password + 'wrongPassword',
                'newPassword': newPassword,
                'verifyPassword': verifyPassword
            })
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.statusCode.should.equal(statusCode.PASSWORD_INCORRECT.statusCode);
                    done();
                }
            });
    });
    it('用户有accessToken，新密码太短，更新失败', function (done) {
        var newPassword = 'newP';
        var verifyPassword = newPassword;
        agent.post('/users/password?accessToken=' + userInfo.accessToken)
            .send({'currentPassword': userInfo.password, 'newPassword': newPassword, 'verifyPassword': verifyPassword})
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.statusCode.should.equal(statusCode.ARGUMENT_ERROR.statusCode);
                    done();
                }
            });
    });
    it('用户有accessToken，两次输入新密码不同，更新失败', function (done) {
        var newPassword = 'newPassword';
        var verifyPassword = newPassword + 'differentPassword';
        agent.post('/users/password?accessToken=' + userInfo.accessToken)
            .send({'currentPassword': userInfo.password, 'newPassword': newPassword, 'verifyPassword': verifyPassword})
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.statusCode.should.equal(statusCode.PASSWORD_NOT_MATCH.statusCode);
                    done();
                }
            });
    });
    it('用户有accessToken，两次输入合法相同，更新成功', function (done) {
        var newPassword = 'newPassword';
        var verifyPassword = newPassword;
        agent.post('/users/password?accessToken=' + userInfo.accessToken)
            .send({'currentPassword': userInfo.password, 'newPassword': newPassword, 'verifyPassword': verifyPassword})
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.should.have.property('statusCode');
                    res.body.statusCode.should.equal(statusCode.SUCCESS.statusCode);
                    done();
                }
            });
    });
    after(function (done) {
        User.remove(function (err) {
            if (err) {
                throw err;
            } else {
                done();
            }
        });
    });
});

describe('GET /users/search', function () {
    var userInfo = {
        username: 'ethanWuTestSearch',
        password: 'siyeelikeit'

    };
    before(function (done) {
        var mock = require('../support/mock');
        mock.mockUser(userInfo, function (err, user) {
            if (err) throw err;
            agent.post('/auth/signin')
                .send(userInfo)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        userInfo.accessToken = res.body.user.accessToken;
                        done();
                    }
                }
            );
        });

    });
    it('无关键字，搜索附近的全部的人，成功', function (done) {
        agent.get('/users/search?keyword=')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.should.have.properties('users','total');
                    res.body.statusCode.should.equal(statusCode.SUCCESS.statusCode);
                    done();
                }
            });
    });
    it('有关键字，搜索附近的人成功', function (done) {
        var keyword = 'keyword';
        agent.get('/users/search?keyword=')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.should.have.properties('users','total');
                    res.body.statusCode.should.equal(statusCode.SUCCESS.statusCode);
                    done();
                }
            });
    });


    after(function (done) {
        User.remove(function (err) {
            if (err) {
                throw err;
            } else {
                done();
            }
        });
    });
});

describe('POST /users/update-location', function () {
    var userInfo = {
        username: 'ethanWuTestUpdateLocation',
        password: 'siyeelikeit'
    };
    before(function (done) {
        var mock = require('../support/mock');
        mock.mockUser(userInfo, function (err, user) {
            if (err) throw err;
            agent.post('/auth/signin')
                .send(userInfo)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        userInfo.accessToken = res.body.user.accessToken;
                        done();
                    }
                }
            );
        });

    });
    it('用户无accessToken，更新位置失败', function (done) {
        var longitude = 1;
        var latitude = 1;
        agent.post('/users/update-location?accessToken=')
            .send({'longitude': longitude, 'latitude': latitude})
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.statusCode.should.equal(statusCode.TOKEN_REQUIRED.statusCode);
                    done();
                }
            });
    });
    it('用户有accessToken，缺少经/纬度，更新失败', function (done) {
        var longitude = 1;
        var latitude = 1;
        agent.post('/users/update-location?accessToken=' + userInfo.accessToken)
            .send({'longitude': longitude,'latitude':''})
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.statusCode.should.equal(statusCode.ARGUMENT_REQUIRED.statusCode);
                    done();
                }
            });
    });
    it('用户有accessToken，经纬度数值不符合范围，更新失败', function (done) {
        var longitude = 1111;
        var latitude = 1;
        agent.post('/users/update-location?accessToken=' + userInfo.accessToken)
            .send({'longitude': longitude, 'latitude': latitude})
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.statusCode.should.equal(statusCode.ARGUMENT_REQUIRED.statusCode);
                    done();
                }
            });
    });
    it('用户有accessToken，经纬度数值符合范围，更新成功', function (done) {
        var longitude = Math.random() * (180 - (-180) + 1) + (-180);
        var latitude = Math.random() * (90 - (-90) + 1) + (-90);
        agent.post('/users/update-location?accessToken=' + userInfo.accessToken)
            .send({'longitude': longitude, 'latitude': latitude})
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.should.have.properties('statusCode','message');
                    res.body.statusCode.should.equal(statusCode.SUCCESS.statusCode);
                    done();
                }
            });
    });
    after(function (done) {
        User.remove(function (err) {
            if (err) {
                throw err;
            } else {
                done();
            }
        });
    });
});
