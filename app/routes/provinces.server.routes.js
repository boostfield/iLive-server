'use strict';

module.exports = function (app) {
    var users = require('../../app/controllers/users.server.controller');
    var provinces = require('../../app/controllers/provinces.server.controller');

    // Provinces Routes
    app.route('/provinces')
        .get(provinces.list)
        .post(users.authToken, users.hasAuthorization(['admin']), provinces.create);
    app.route('/provinces/:provinceId/cities')
        .get(provinces.getCities);
    app.route('/provinces/:provinceId')
        .get(provinces.read)
        .put(users.authToken, users.hasAuthorization(['admin']), provinces.update)
        .delete(users.authToken, users.hasAuthorization(['admin']), provinces.delete);

    // Finish by binding the Province middleware
    app.param('provinceId', provinces.provinceByID);
};
