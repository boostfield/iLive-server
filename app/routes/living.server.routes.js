'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var living = require('../../app/controllers/living.server.controller');

	// Banners Routes
	app.route('/living/start').post(living.startLiving);
	app.route('/living/stop').post(living.stopLiving);
	app.route('/livings').get(living.livingRoomList);
};
