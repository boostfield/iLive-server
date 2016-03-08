'use strict';

module.exports = function (app) {
    var users = require('../../app/controllers/users.server.controller');
    var taskLists = require('../../app/controllers/task-lists.server.controller');

    // Task lists Routes
    app.route('/task-lists')
        .get(users.authToken, users.hasAuthorization(['visitor', 'user']), taskLists.list)
        .post(users.authToken, users.hasAuthorization(['admin']), taskLists.create);
    app.route('/users/:userId([A-Za-z0-9]{24})/task-lists')
        .get(users.authToken, users.hasAuthorization(['user']), taskLists.list);
    app.route('/task-lists/:taskListId([A-Za-z0-9]{24})')
        .get(users.authToken, users.hasAuthorization(['visitor', 'user']), taskLists.read)
        .put(users.authToken, users.hasAuthorization(['admin']), taskLists.update)
        .delete(users.authToken, users.hasAuthorization(['admin']), taskLists.delete);
    app.route('/task-lists/:taskListId([A-Za-z0-9]{24})/star')
        .post(users.authToken, users.hasAuthorization(['user']), taskLists.starTaskList);
    app.route('/task-lists/:taskListId([A-Za-z0-9]{24})/starred-users')
        .get(users.authToken, users.hasAuthorization(['visitor', 'user']), taskLists.getStarredUsers);
    app.route('/task-lists/:taskListId([A-Za-z0-9]{24})/unstar')
        .post(users.authToken, users.hasAuthorization(['user']), taskLists.unstarTaskList);
    app.route('/task-lists/:taskListId([A-Za-z0-9]{24})/share')
        .get(taskLists.share);
    // Finish by binding the Task list middleware
    app.param('taskListId', taskLists.taskListByID);
};
