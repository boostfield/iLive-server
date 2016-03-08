'use strict';

module.exports = function (app) {
    var users = require('../../app/controllers/users.server.controller');
    var instantPurchaseController = require('../../app/controllers/instant-purchase.server.controller');

    app.route('/activities/instant-purchase')
        .get(instantPurchaseController.getPurchasePage);
    app.route('/activities/instant-purchase/status').get(instantPurchaseController.getActivityStatus);
    app.route('/activities/detail').get(instantPurchaseController.getDetail);
    app.route('/activities/instant-purchase').post(users.authToken, users.hasAuthorization(['user']), instantPurchaseController.purchase);

};
