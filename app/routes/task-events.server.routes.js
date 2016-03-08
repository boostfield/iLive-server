'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var taskEvents = require('../../app/controllers/task-events.server.controller');

	// Task events Routes
	app.route('/task-events')
		.get(taskEvents.list);

	app.route('/task-events/:taskEventId')
		.get(taskEvents.read)
		.put(users.requiresLogin, taskEvents.hasAuthorization, taskEvents.update)
		.delete(users.requiresLogin, taskEvents.hasAuthorization, taskEvents.delete);
	app.route('/tasks/:taskId/rating')
		.get(users.authToken,taskEvents.getRating);

	// Finish by binding the Task event middleware
	app.param('taskEventId', taskEvents.taskEventByID);
};
