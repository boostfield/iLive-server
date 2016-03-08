/**
 * Created by wangerbing on 15/9/22.
 */

'use strict';

module.exports = function (app) {
    var users = require('../../app/controllers/users.server.controller');
    var quotaRecorders = require('../controllers/quota-recorders.server.controller.js');

    // Scenic spots Routes
    app.route('/quota-recorders')
        .get(quotaRecorders.quotaRecorderList);
    app.route('/quota-recorders/:quotaRecorderId')
        .get(quotaRecorders.read);
    app.route('/tasks/:taskId/apply-for-quota')
        .post(users.authToken, users.hasAuthorization(['tenant']), quotaRecorders.applyForQuota);
    app.route('/quota-recorders/:quotaRecorderId/handle-request')
        .post(users.authToken, users.hasAuthorization(['admin']), quotaRecorders.handleRequest);

    app.route('/quota-recorders/tasks/:taskId/auth-tenant')
        .get(quotaRecorders.authTenant);
    app.param('quotaRecorderId', quotaRecorders.quotaRecorderById);
};

