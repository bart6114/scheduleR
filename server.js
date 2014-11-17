'use strict';

process.chdir(__dirname);

/**
 * Module dependencies.
 */
var init = require('./config/init')(),
	config = require('./config/config'),
	mongoose = require('mongoose');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

var dbConn = (process.env.NODE_ENV == 'production' ?
				config.userConfig.db.url.replace(/\/$/, '') + '/' + config.userConfig.db.suffix :
				config.db
);

// Bootstrap db connection
var db = mongoose.connect(dbConn, function(err) {
	if (err) {
		console.error('\x1b[31m', 'Could not connect to MongoDB!');
		console.log(err);
	}
});

// Init the express application
var app = require('./config/express')(db);

// Bootstrap passport config
require('./config/passport')();

// Start the app by listening on <port>

var port= (process.env.NODE_ENV == 'production' ? config.userConfig.port : config.port);
app.listen(port);

// Expose app
exports = module.exports = app;

// Logging initialization
console.log('scheduleR started on port ' + port);
