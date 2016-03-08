'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var banners = require('../../app/controllers/banners.server.controller');

	// Banners Routes
	app.route('/banners')
		.get(banners.list)
		.post(users.hasAuthorization(['admin']), banners.create);

	app.route('/banners/:bannerId')
		.get(banners.read)
		.put(users.hasAuthorization(['admin']), banners.update)
		.delete(users.hasAuthorization(['admin']), banners.delete);

	// Finish by binding the Banner middleware
	app.param('bannerId', banners.bannerByID);
};
