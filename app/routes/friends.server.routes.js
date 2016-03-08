'use strict';

module.exports = function (app) {
    var users = require('../../app/controllers/users.server.controller');
    var friends = require('../../app/controllers/friends.server.controller');


    app.route('/friends')
        .get(users.authToken, users.hasAuthorization(['user']),friends.getFriendList);
    app.route('/friends/:userId([A-Za-z0-9]{24})')//friendId == userId == _id;
        .get(users.authToken, users.hasAuthorization(['user']),friends.getFriend);
    app.route('/friends/:userId([A-Za-z0-9]{24})/deleteFriend')
        .post(users.authToken, users.hasAuthorization(['user']),friends.deleteFriend);
    app.route('/friends/addFriend')
        .post(users.authToken, users.hasAuthorization(['user']),friends.addFriend);

    //black list api
    app.route('/users/:userId/block').post(users.authToken, friends.addToBlackList);
    app.route('/users/:userId/block').delete(users.authToken, friends.removeFromBlackList);
};
