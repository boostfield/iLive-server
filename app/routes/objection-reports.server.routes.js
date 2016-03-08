'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var objectionReports = require('../../app/controllers/objection-reports.server.controller');

	// Objection reports Routes
	app.route('/user/:userId/report')
		.post(users.authToken, objectionReports.create);
    app.route('/content/report')
        .post(users.authToken, objectionReports.create);
    app.route('/objection-reports')
        .get(users.authToken, users.hasAuthorization(['admin']), objectionReports.list);

    app.route('/objection-reports/:objectionReportId')
		.get(objectionReports.read)
		.put(users.requiresLogin, objectionReports.hasAuthorization, objectionReports.update)
		.delete(users.requiresLogin, objectionReports.hasAuthorization, objectionReports.delete);

	// Finish by binding the Objection report middleware
	app.param('objectionReportId', objectionReports.objectionReportByID);
};
