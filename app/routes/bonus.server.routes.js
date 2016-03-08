/**
 * Created by Ethan-Wu on 12/28/15.
 */
'use strict';

module.exports = function (app) {
    var users = require('../../app/controllers/users.server.controller');
    var bonus = require('../../app/controllers/bonus.server.controller');
    app.route('/bonus')
        .post(users.authToken, users.hasAuthorization(['user']), bonus.addBonus);
};
