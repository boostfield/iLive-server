/**
 * Created by wangerbing on 15-4-1.
 */
'use strict';

module.exports = function (app) {
    var users = require('../../app/controllers/users.server.controller');
    var comments = require('../../app/controllers/comments.server.controller');
    var taskList = require('../../app/controllers/task-lists.server.controller');

    app.route('/task-lists/:taskListId([A-Za-z0-9]{24})/comments')
        .post(users.authToken, users.hasAuthorization(['user']), comments.createTaskListComment)
        .get(users.authToken, users.hasAuthorization(['visitor', 'user']), comments.getTaskListComments);

    app.route('/tasks/:taskId([A-Za-z0-9]{24})/comments')
        .post(users.authToken, users.hasAuthorization(['user']), comments.createTaskComment)
        .get(users.authToken, users.hasAuthorization(['visitor', 'user']), comments.getTaskComments);

    app.route('/comments/:commentId([A-Za-z0-9]{24})/reply')
        .post(users.authToken, users.hasAuthorization(['user']), comments.replyComment);

    app.route('/comments/:commentId([A-Za-z0-9]{24})')
        .delete(users.authToken, users.hasAuthorization(['user']), comments.deleteComment);

    // comments middleware
    app.param('commentId', comments.commentById);
    app.param('taskListId', taskList.taskListByID);
};

