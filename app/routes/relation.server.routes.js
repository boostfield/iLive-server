'use strict';

module.exports = function (app) {
    var users = require('../../app/controllers/users.server.controller');
    var relation = require('../../app/controllers/relation.server.controller');

    // Relation Routes
    app.route('/users/:userId/following')
        .post(users.requiresLogin, relation.addFollowing)
        .get(users.requiresLogin,relation.followingList);
    app.route('/users/:userId/follower')
        .get( users.requiresLogin, relation.followerList);
};
