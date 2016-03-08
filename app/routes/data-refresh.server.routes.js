'use strict';

module.exports = function(app) {
    var users = require('../../app/controllers/users.server.controller');
    var refresher = require('../../app/controllers/data-refresh.server.controller');

    app.route('/refresh-ease-friend')
        .get(users.hasAuthorization(['super-admin']), refresher.refreshEaseMobService);
    app.route('/refresh-avatar-exif-info')
        .get(users.hasAuthorization(['super-admin']), refresher.refreshUserAvatarExifInfo);

};
