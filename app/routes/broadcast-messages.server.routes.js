'use strict';

module.exports = function (app) {
    var users = require('../../app/controllers/users.server.controller');
    var broadcastMessages = require('../../app/controllers/broadcast-messages.server.controller');

    app.route('/my-message').get(users.authToken,users.hasAuthorization(['user']),broadcastMessages.getMessageList);
    app.route('/message/:broadcastMessageId([A-Za-z0-9]{24})/set-read').post(users.authToken,users.hasAuthorization(['user']),broadcastMessages.setRead);
    app.route('/message/unread-count').get(users.authToken,users.hasAuthorization(['user']),broadcastMessages.getUnReadCount);
};
