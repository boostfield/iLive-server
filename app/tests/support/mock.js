'use strict';
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    ScenicSpot = mongoose.model('ScenicSpot'),
    City = mongoose.model('City'),
    Task = mongoose.model('Task');

exports.mockUser = function (userInfo, done) {
    var user = new User({
        username: userInfo.username,
        password: userInfo.password,
        displayName: '用户' + userInfo.username,
        provider: 'local'
    });
    if(userInfo.phoneNumber){
        user.phoneNumber = userInfo.phoneNumber;
    }
    user.save(function (err, user) {
        done(err, user);
    });
};

exports.mockCity = function (cityInfo, done) {
    var city = new City({
        name: '测试城市',
        country: '551115cea6ab3f760913b2e5',
        province: '55bb5075c0ed3cae06606cb8'
    });

    city.save(function (err, city) {
        done(err, city);
    });
};

exports.mockScenicSpot = function (scenicSpotInfo, done) {
    var scenicSpot = new ScenicSpot({
        name: scenicSpotInfo.name,
        location: scenicSpotInfo.location,
        city: '55bb4b63c8b0fa6f063edafb'
    });

    scenicSpot.save(function (err, scenicSpot) {
        done(err, scenicSpot);
    });
};

exports.mockTask = function (taskInfo, done) {
    var task = new Task({
        name: taskInfo.name,
        bonus: taskInfo.bonus,
        belongToScenicSpot: taskInfo.belongToScenicSpot,
        belongToUser: taskInfo.belongToUser
    });

    task.save(function (err, task) {
        done(err, task);
    });
};
