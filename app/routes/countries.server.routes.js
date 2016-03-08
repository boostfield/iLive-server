'use strict';

module.exports = function (app) {
    var users = require('../../app/controllers/users.server.controller');
    var countries = require('../../app/controllers/countries.server.controller');

    // Countries Routes
    app.route('/countries')
        .get(users.authToken, countries.list)
        .post(users.authToken, users.hasAuthorization(['admin']), countries.create);

    app.route('/countries/:countryId')
        .get(users.authToken, countries.read)
        .put(users.authToken, users.hasAuthorization(['admin']), countries.update)
        .delete(users.authToken, users.hasAuthorization(['admin']), countries.delete);
    app.route('/countries/:countryId/provinces').get(countries.getProvinces);
    // Finish by binding the Country middleware
    app.param('countryId', countries.countryByID);
};
