'use strict';

module.exports = function(app) {
    // Root routing
    var core = require('../../app/controllers/core');
    app.route('/')
        .get(core.index);

    app.route('/version')
        .get(core.version);

    app.route('/get_stats')
        .get(core.stats);
};
