'use strict';

module.exports = function (app) {
    var users = require('../../app/controllers/users.server.controller');
    var cities = require('../../app/controllers/cities.server.controller');

    // Cities Routes
    app.route('/cities')
        .get(cities.list)
        .post(users.authToken, users.hasAuthorization(['admin']), cities.create);
    app.route('/cities/:cityId/scenic-spots')
        .get(cities.getScenicSpots);
    app.route('/cities/search').get(cities.search);
    app.route('/cities/hot').get(cities.getHotCities);
//获取城市下面的景点列表，手机端
    app.route('/cities/:cityId/scenic-spots-mobile')
        .get(cities.getScenicSpotsByMobile);

    app.route('/cities/:cityId')
        .get(cities.read)
        .put(users.authToken, users.hasAuthorization(['editor']), cities.update)
        .delete(users.authToken, users.hasAuthorization(['admin']), cities.delete);

    // Finish by binding the City middleware
    app.route('/cities-cascade')
        .get(users.authToken, cities.getCityCascade);

    app.param('cityId', cities.cityByID);
};
