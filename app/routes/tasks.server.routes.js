'use strict';

module.exports = function (app) {
    var users = require('../../app/controllers/users.server.controller');
    var tasks = require('../../app/controllers/tasks.server.controller');
    var taskEvent = require('../../app/controllers/task-events.server.controller');

    // Tasks Routes
    app.route('/tasks')
        .get(users.authToken, users.hasAuthorization(['visitor', 'user']), tasks.list)
        .post(users.authToken, users.hasAuthorization(['admin']), tasks.create);
    app.route('/tasks/search')
        .get(users.authToken, users.hasAuthorization(['visitor', 'user']), tasks.search);
    app.route('/tasks-by-location')
        .get(users.authToken, users.hasAuthorization(['visitor', 'user']), tasks.getTasksByLocation);
    app.route('/tasks/refresh-location')
        .get(users.authToken, users.hasAuthorization(['admin']), tasks.refreshTaskLocation);

    app.route('/tasks/:taskId([A-Za-z0-9]{24})/star').post(users.authToken, users.hasAuthorization(['user']), taskEvent.starTask);
    app.route('/users/:userId/tasks/starred').get(users.authToken, users.hasAuthorization(['user']), tasks.starredTask);
    app.route('/tasks/:taskId([A-Za-z0-9]{24})/unstar').post(users.authToken, users.hasAuthorization(['user']), taskEvent.unstarTask);
    app.route('/tasks/:taskId([A-Za-z0-9]{24})/starred-user').get(users.authToken, users.hasAuthorization(['visitor', 'user']), tasks.getStarredUser);
    app.route('/tasks/:taskId([A-Za-z0-9]{24})/pictures').get(users.authToken, users.hasAuthorization(['visitor', 'user']), tasks.getPictures);
    app.route('/tasks/:taskId([A-Za-z0-9]{24})/rate').post(users.authToken, users.hasAuthorization(['user']), taskEvent.rateTask);

    app.route('/tasks/:taskId([A-Za-z0-9]{24})')
        .get(users.authToken, users.hasAuthorization(['visitor', 'user']), tasks.read)
        .put(users.authToken, users.hasAuthorization(['admin']), tasks.update);
    app.route('/mobile/tasks/:taskId([A-Za-z0-9]{24})')
        .get(users.authToken, users.hasAuthorization(['visitor', 'user']), tasks.readWithStatus);

    app.route('/tasks/:taskId([A-Za-z0-9]{24})/verify-code')
        .get(users.authToken, users.hasAuthorization(['user']), tasks.getVerifyCode)
        .post(users.authToken, users.hasAuthorization(['tenant']), tasks.hasAuthorization, tasks.authUser);

    app.route('/tasks/:taskId([A-Za-z0-9]{24})/verify-by-qr')
        .get(tasks.finishTaskByQR);
    app.route('/tasks/:taskId([A-Za-z0-9]{24})/grant-awards')
        .post(users.authToken, users.hasAuthorization(['tenant']), tasks.hasAuthorization, tasks.finishTask);

    app.route('/tasks/:taskId([A-Za-z0-9]{24})/add-quota')
        .put(users.authToken, users.hasAuthorization(['admin']), tasks.addQuotaRecord);

    app.route('/tasks/:taskId([A-Za-z0-9]{24})/quota-recorder')
        .get(users.authToken, users.hasAuthorization(['admin']), tasks.getQuotaRecord);
    app.route('/tasks/:taskId([A-Za-z0-9]{24})/share').get(tasks.shareTask);
    app.route('/tasks/:taskId([A-Za-z0-9]{24})')
        .delete(users.authToken, users.hasAuthorization(['admin']), tasks.delete);
    app.route('/tasks/select-task-count')
        .get(users.authToken, users.hasAuthorization(['admin']), tasks.checkSelectedByEditor);
    app.route('/tasks/selected')
        .get(users.authToken, users.hasAuthorization(['visitor','user']), tasks.selectedTasksList);
    // Finish by binding the Task middleware
    app.param('taskId', tasks.taskByID);
};
