/**
 * Created by wangerbing on 15/12/1.
 */

'use strict';
var should = require('should'),
    request = require('supertest'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    app = require('../../../server'),
    statusCode = require('../../utils/status-code'),
    Counter = mongoose.model('Counter'),
    PageRank = mongoose.model('PurchaseRank'),
    agent = request(app);

describe('POST /activities/instant-purchase', function () {
    var userInfo = {
        username: 'erBingWangTestInstantPurchase',
        password: 'siyeeorg'
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
    it('第一次抢任务，成功', function (done) {
        agent.post('/activities/instant-purchase?platform=Androids&accessToken=' + userInfo.accessToken)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.should.have.properties('statusCode', 'rank');
                    res.body.statusCode.should.equal(statusCode.SUCCESS.statusCode);
                    res.body.rank.should.be.a.Number();
                    done();
                }
            });
    });
    it('第二次抢任务，失败', function (done) {
        agent.post('/activities/instant-purchase?platform=Androids&accessToken=' + userInfo.accessToken)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                } else {
                    res.body.statusCode.should.equal(statusCode.ACTIVITY_PARTICIPATED.statusCode);
                    done();
                }
            });
    });
    after(function (done) {
        PageRank.remove(function (err) {
            if (err) {
                throw err;
            } else {
                User.remove(function (err) {
                    if (err) {
                        throw err;
                    } else {
                        Counter.remove(function (err) {
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
    });
});
