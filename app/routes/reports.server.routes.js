'use strict';

module.exports = function(app) {
    var users = require('../../app/controllers/users');
    var reports = require('../../app/controllers/reports');

    // Reports Routes
    app.route('/reports')
        .get(users.requiresLogin, reports.list)
        .post(users.requiresLogin, reports.create);

    app.route('/reports/:reportId/run')
        .post(users.requiresLogin, reports.hasAuthorization, reports.runOnce);

    app.route('/reports/:reportId')
        .get(users.requiresLogin, reports.read)
        .put(users.requiresLogin, reports.hasAuthorization, reports.update)
        .delete(users.requiresLogin, reports.hasAuthorization, reports.delete);


    // Finish by binding the Report middleware
    app.param('reportId', reports.reportByID);
};
