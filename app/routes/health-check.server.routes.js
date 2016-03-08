'use strict';

module.exports = function (app) {
    var statusCode = require('../utils/status-code');

    // Health check Routes
    app.route('/health-check')
        .get(function(req,res){
            return res.jsonp({
                statusCode:statusCode.SUCCESS.statusCode
            });
        });
};
