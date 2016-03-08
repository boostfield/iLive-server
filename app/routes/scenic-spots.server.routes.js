'use strict';

module.exports = function (app) {
    var users = require('../../app/controllers/users.server.controller');
    var scenicSpots = require('../../app/controllers/scenic-spots.server.controller');

    // Scenic spots Routes
    app.route('/scenic-spots')
        .get(scenicSpots.list)
        .post(users.authToken, users.hasAuthorization(['user']), scenicSpots.create);
    app.route('/scenic-spots/search').get(scenicSpots.list);
    app.route('/scenic-spots/:scenicSpotId([A-Za-z0-9]{24})/check').put(users.authToken, users.hasAuthorization(['user']), scenicSpots.checkInfo);
    app.route('/scenic-spots/search-in-cities').get(scenicSpots.list);
    app.route('/scenic-spots/:scenicSpotId([A-Za-z0-9]{24})')
        .get(scenicSpots.read)
        .put(users.authToken, users.hasAuthorization(['user']), scenicSpots.update)
        .delete(users.authToken, users.hasAuthorization(['admin']), scenicSpots.delete);

    //查看景点详情，手机端
    app.route('/scenic-spots/:scenicSpotId([A-Za-z0-9]{24})/read-by-mobile')
        .get(users.authToken,users.hasAuthorization(['user']),scenicSpots.readByMobile);
    //对景点点赞
    app.route('/scenic-spots/:scenicSpotId([A-Za-z0-9]{24})/vote')
        .put(users.authToken, scenicSpots.likeScenicSpot);
    //对景点取消点赞
    app.route('/scenic-spots/:scenicSpotId([A-Za-z0-9]{24})/cancel-vote')
        .put(users.authToken,scenicSpots.cancelLikeScenicSpot);
    app.route('/scenic-spots/:scenicSpotId([A-Za-z0-9]{24})/pictures')
        .get(users.authToken,users.hasAuthorization(['user']),scenicSpots.getPictureList);

    app.route('/scenic-spots/checked-type-list')
        .get(users.authToken, users.hasAuthorization(['admin']), scenicSpots.getCheckedTypeList);
    app.route('/scenic-spots/:scenicSpotId/checked-scenicSpot')
        .post(users.authToken, users.hasAuthorization(['admin']), scenicSpots.checkScenicSpot);

    app.route('/scenic-spots/:scenicSpotId/nearby-scenicspots')
        .get(users.authToken, users.getNearbyScenicspot);
    app.route('/scenic-spots/:scenicSpotId/nearby-tasks')
        .get(users.authToken, users.getNearbyTasksByScenicSpotId);
    app.route('/scenic-spots/:scenicSpotId([A-Za-z0-9]{24})/all-vote-user')
        .get(users.authToken, users.hasAuthorization(['user']), scenicSpots.getVoteScenicSpotUsers);

    app.param('scenicSpotId', scenicSpots.scenicSpotByID);
};
