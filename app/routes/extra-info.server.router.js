'use strict';

module.exports = function (app) {
    var extraInfo = require('../../app/controllers/extra-info.server.controller');

    app.route('/user-protocol')
        .get(extraInfo.getUserProtocol);
    app.route('/help-doc')
        .get(extraInfo.getHelpDoc);
    app.route('/check-update').get(extraInfo.checkUpdate);
    app.route('/ios-client-url').get(extraInfo.getClientUrl);
    app.route('/download/app').get(extraInfo.getDownloadUrl);
};
