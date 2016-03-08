'use strict';

module.exports = function (app) {
    var users = require('../../app/controllers/users.server.controller');
    var userFeedbacks = require('../../app/controllers/user-feedbacks.server.controller');

    // User feedbacks Routes
    app.route('/user-feedbacks')
        .get(users.authToken, users.hasAuthorization(['admin']), userFeedbacks.list)
        .post(users.authToken, userFeedbacks.create);
    app.route('/user-feedbacks/:userFeedbackId')
        .get(users.authToken, users.hasAuthorization(['admin']), userFeedbacks.read)
        .put(users.authToken, users.hasAuthorization(['admin']), userFeedbacks.update)
        .delete(users.authToken, users.hasAuthorization(['admin']), userFeedbacks.delete);

    // Finish by binding the User feedback middleware
    app.param('userFeedbackId', userFeedbacks.userFeedbackByID);
};
