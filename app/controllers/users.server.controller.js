'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * Extend user's controller
 */
module.exports = _.extend(
    require('./users/users.authentication.server.controller'),
    require('./users/users.authorization.server.controller'),
    require('./users/users.password.server.controller'),
    require('./users/users.profile.server.controller'),
    require('./users/users.location.server.controller.js'),
    require('./users/users.history.server.controller.js'),
    require('./users/users.share.server.controller.js')
);
