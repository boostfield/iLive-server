'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var gifts = require('../../app/controllers/gifts.server.controller');

	// Banners Routes
	app.route('/gifts')
		.get(gifts.list)
		.post(users.hasAuthorization(['admin']), gifts.create);

	app.route('/banners/:bannerId')
		.get(gifts.read)
		.put(users.hasAuthorization(['admin']), gifts.update)
		.delete(users.hasAuthorization(['admin']), gifts.delete);

	// Finish by binding the Banner middleware
	app.param('bannerId', gifts.giftByID);
};
