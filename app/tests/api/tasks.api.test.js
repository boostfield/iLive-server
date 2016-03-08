/**
 * Created by wangerbing on 15/12/7.
 */

'use strict';
var should = require('should'),
    request = require('supertest'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    ScenicSpot = mongoose.model('ScenicSpot'),
    Task = mongoose.model('Task'),
    TaskEvent = mongoose.model('TaskEvent'),
    City = mongoose.model('City'),
    app = require('../../../server'),
    statusCode = require('../../utils/status-code'),
    async = require('async'),
    agent = request(app);

var userInfo1 = {
    username: 'erBingWangTestTaskUser1',
    password: 'siyeeorg',
    roles: [
        'user',
        'editor',
        'admin'
    ]
};
var userInfo2 = {
    username: 'erBingWangTestTaskUser2',
    password: 'siyeeorg'
};
var userInfo3 = {
    username: 'erBingWangTestTaskUser3',
    password: 'siyeeorg'
};
var mock = require('../support/mock');
var cityInfo = {
    name: '测试城市',
    country: '551115cea6ab3f760913b2e5',
    province: '55bb5075c0ed3cae06606cb8'
};
var scenicSpotInfo = {
    name: 'testScenicSpot',
    location: {
        lat: 1,
        lng: 1
    },
    city: '55bb4b63c8b0fa6f063edafb'
};
var taskInfo1 = {
    name: 'taskName1',
    bonus: 'taskBonus'
};
var taskInfo2 = {
    name: 'taskName2',
    bonus: 'taskBonus'
};
var taskInfo3 = {
    name: 'taskName3',
    bonus: 'taskBonus'
};

describe.only('POST /排序', function () {

    before(function (done) {
        async.waterfall([
                function (cb) {
                    mock.mockUser(userInfo1, function (err, user) {
                        if (err) throw err;
                        agent.post('/auth/signin')
                            .send(userInfo1)
                            .end(function (err, res) {
                                if (err) {
                                    cb(err);
                                } else {
                                    userInfo1.accessToken = res.body.user.accessToken;
                                    userInfo1.id = res.body.user.id;
                                    scenicSpotInfo.belongToUser = res.body.user.id;
                                    taskInfo1.belongToUser = res.body.user.id;
                                    taskInfo2.belongToUser = res.body.user.id;
                                    taskInfo3.belongToUser = res.body.user.id;
                                    cb();
                                }
                            }
                        );
                    });
                },
                function (cb) {
                    mock.mockUser(userInfo2, function (err, user) {
                        if (err) throw err;
                        agent.post('/auth/signin')
                            .send(userInfo2)
                            .end(function (err, res) {
                                if (err) {
                                    cb(err);
                                } else {
                                    userInfo2.accessToken = res.body.user.accessToken;
                                    userInfo2.id = res.body.user.id;
                                    cb();
                                }
                            }
                        );
                    });
                },
                function (cb) {
                    mock.mockUser(userInfo3, function (err, user) {
                        if (err) throw err;
                        agent.post('/auth/signin')
                            .send(userInfo3)
                            .end(function (err, res) {
                                if (err) {
                                    cb(err);
                                } else {
                                    userInfo3.accessToken = res.body.user.accessToken;
                                    userInfo3.id = res.body.user.id;
                                    cb();
                                }
                            }
                        );
                    });
                },
                function (cb) {
                    mock.mockCity(cityInfo, function (err, city) {
                        if (err) cb(err);
                        else {
                            scenicSpotInfo.belongToCity = city.id;
                            cb();
                        }
                    });
                },
                function (cb) {
                    mock.mockScenicSpot(scenicSpotInfo, function (err, scenicSpot) {
                        if (err) cb(err);
                        else {
                            scenicSpotInfo.id = scenicSpot.id;
                            taskInfo1.belongToScenicSpot = scenicSpot.id;
                            taskInfo2.belongToScenicSpot = scenicSpot.id;
                            taskInfo3.belongToScenicSpot = scenicSpot.id;
                            cb();
                        }
                    });
                },
                function (cb) {
                    mock.mockTask(taskInfo1, function (err, task) {
                        if (err) cb(err);
                        else {
                            taskInfo1.id = task.id;
                            cb();
                        }
                    });
                },
                function (cb) {
                    mock.mockTask(taskInfo2, function (err, task) {
                        if (err) cb(err);
                        else {
                            taskInfo2.id = task.id;
                            cb();
                        }
                    });
                },
                function (cb) {
                    mock.mockTask(taskInfo3, function (err, task) {
                        if (err) cb(err);
                        else {
                            taskInfo3.id = task.id;
                            cb();
                        }
                    });
                },
                function (cb) {
                    agent.post('/tasks/' + taskInfo1.id + '/star?accessToken=' + userInfo1.accessToken)
                        .expect(200)
                        .end(function (err, res) {
                            if (err) {
                                cb(err);
                            } else {
                                cb();
                            }
                        });

                },
                function (cb) {
                    agent.post('/tasks/' + taskInfo1.id + '/star?accessToken=' + userInfo2.accessToken)
                        .expect(200)
                        .end(function (err, res) {
                            if (err) {
                                cb(err);
                            } else {
                                cb();
                            }
                        });

                },
                function (cb) {
                    agent.post('/tasks/' + taskInfo1.id + '/star?accessToken=' + userInfo3.accessToken)
                        .expect(200)
                        .end(function (err, res) {
                            if (err) {
                                cb(err);
                            } else {
                                cb();
                            }
                        });

                },
                function (cb) {
                    agent.post('/tasks/' + taskInfo2.id + '/star?accessToken=' + userInfo1.accessToken)
                        .expect(200)
                        .end(function (err, res) {
                            if (err) {
                                cb(err);
                            } else {
                                cb();
                            }
                        });

                },
                function (cb) {
                    agent.post('/tasks/' + taskInfo3.id + '/star?accessToken=' + userInfo1.accessToken)
                        .expect(200)
                        .end(function (err, res) {
                            if (err) {
                                cb(err);
                            } else {
                                cb();
                            }
                        });

                }

            ],
            function (err) {
                if (err) {
                    console.dir('--err:' + err);
                    done();
                } else {
                    done();
                }
            }
        );
    });
    it('检测收藏一个任务的User排序', function (done) {
        agent.get('/tasks/' + taskInfo1.id + '/starred-user?accessToken=' + userInfo1.accessToken)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    console.dir('err:' + err);
                } else {
                    res.body.statusCode.should.be.equal(statusCode.SUCCESS.statusCode);
                    res.body.total.should.equal(3);
                    res.body.users[0].id.should.equal(userInfo3.id);
                    res.body.users[1].id.should.equal(userInfo2.id);
                    res.body.users[2].id.should.equal(userInfo1.id);
                    done();
                }
            });
    });
    it('一个人收藏的任务排序', function (done) {
        agent.get('/users/' + userInfo1.id + '/tasks/starred?accessToken=' + userInfo1.accessToken)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    console.dir('err:' + err);
                } else {
                    res.body.statusCode.should.be.equal(statusCode.SUCCESS.statusCode);
                    res.body.total.should.equal(3);
                    res.body.tasks[0].id.should.equal(taskInfo3.id);
                    res.body.tasks[1].id.should.equal(taskInfo2.id);
                    res.body.tasks[2].id.should.equal(taskInfo1.id);
                    done();
                }
            });
    });
    after(function (done) {
        User.remove(function (err) {
            if (err) {
                throw err;
            } else {
                ScenicSpot.remove(function (err) {
                    if (err) {
                        throw err;
                    } else {
                        Task.remove(function (err) {
                            if (err) {
                                throw err;
                            } else {
                                TaskEvent.remove(function (err) {
                                    if (err) {
                                        throw err;
                                    } else {
                                        City.remove(function (err) {
                                            if (err) {
                                                throw err;
                                            } else {
                                                done();
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
});
