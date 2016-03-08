/**
 * Created by wangerbing on 15/12/22.
 */

'use strict';

module.exports = function (app) {
    var users = require('../../app/controllers/users.server.controller');
    var areas = require('../../app/controllers/areas.server.controller');

    // Areas Routes
    app.route('/areas')
        .post(users.authToken, users.hasAuthorization(['admin']), areas.create);
    app.route('/areas/:areaId')
        .delete(users.authToken, users.hasAuthorization(['admin']), areas.delete)
        .put(users.authToken, users.hasAuthorization(['admin']), areas.update);

    app.route('/cities/:cityId/areas')
        .get(users.authToken, users.hasAuthorization(['visitor','user']), areas.getAreasByCityId);

    app.param('areaId', areas.areaByID);

};
