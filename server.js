'use strict';
/**
 * Module dependencies.
 */
//require('oneapm');
var init = require('./config/init')(),
    config = require('./config/config'),
    mongoose = require('mongoose');
/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Bootstrap db connection
mongoose.connect(config.db);
var db = mongoose.connection;
mongoose.set('debug',  config.mongoose.debugFlag);
// Init the express application
var app = require('./config/express')(db);

// Bootstrap passport config
require('./config/passport')();

// Start the app by listening on <port>
//app.listen(config.port);

// Expose app
module.exports = app;

// Logging initialization
console.log('jackfruit server application started on port ' + config.port);
