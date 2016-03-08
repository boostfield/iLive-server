'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var scenicAreas = require('../../app/controllers/scenic-areas.server.controller');

	// Scenic areas Routes
	app.route('/scenic-areas')
		.get(scenicAreas.list)
		.post(users.hasAuthorization(['admin']), scenicAreas.create);

	app.route('/scenic-areas/:scenicAreaId')
		.get(scenicAreas.read)
		.put(users.hasAuthorization(['admin']), scenicAreas.update)
		.delete(users.hasAuthorization(['admin']), scenicAreas.delete);

	// Finish by binding the Scenic area middleware
	app.param('scenicAreaId', scenicAreas.scenicAreaByID);
};
