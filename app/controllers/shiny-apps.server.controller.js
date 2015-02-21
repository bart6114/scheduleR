'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    ShinyApp = mongoose.model('ShinyApp'),
    shinyAppList = require('../helpers/start.shinyapp.server'),
    _ = require('lodash'),
    async = require('async');

/**
 * Goto app
 */

exports.gotoApp = function(req, res) {
    shinyAppList.getAppPort(req.param('shinyAppUrlSuffix'), function(port) {
        if (port) {
            var host = req.get('host').replace(/:.*/, '');
            var redirectUrl = 'http://' + host + ':' + port;
            res.redirect(redirectUrl);
            return;
    });

    res.status(404).send('<p>App not found or not running.... </p> <p>But maybe this cat gives you some relief?</p> \
		<a href="http://thecatapi.com"><img src="http://thecatapi.com/api/images/get?format=src&type=gif"></a>');

};


/**
 * Start a Shiny app
 */

exports.startApp = function(req, res) {
    shinyAppList.startApp(req.shinyApp, function(port, err) {
        res.jsonp({
            err: err,
            port: port
        });

    });

};

/**
 * Stop a Shiny app
 */

exports.stopApp = function(req, res) {
    shinyAppList.stopApp(req.shinyApp);
    // todo: implement error handling
    res.jsonp({
        err: false
    });

};




/**
 * Create a Shiny app
 */
exports.create = function(req, res) {
    var shinyApp = new ShinyApp(req.body);
    shinyApp.user = req.user;

    shinyApp.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(shinyApp);
        }
    });
};

/**
 * Show the current Shiny app
 */
exports.read = function(req, res) {
    // check if app is running
    req.shinyApp = req.shinyApp.toObject();
    req.shinyApp.running = shinyAppList.isRunning(req.shinyApp) ? true : false;

    res.jsonp(req.shinyApp);
};

/**
 * Update a Shiny app
 */
exports.update = function(req, res) {
    var shinyApp = req.shinyApp;

    shinyApp = _.extend(shinyApp, req.body);

    shinyApp.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(shinyApp);
        }
    });
};

/**
 * Delete a Shiny app
 */
exports.delete = function(req, res) {
    var shinyApp = req.shinyApp;

    shinyApp.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(shinyApp);
        }
    });
};

/**
 * List of Shiny apps
 */
exports.list = function(req, res) {
    ShinyApp.find().sort('-created').populate('user', 'displayName').exec(function(err, shinyApps) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {

            async.map(shinyApps, function(shinyApp, callback) {
                var shinyAppTmp = shinyApp.toObject();
                shinyAppTmp.running = shinyAppList.isRunning(shinyAppTmp) ? true : false;

                callback(null, shinyAppTmp);
            }, function(err, results) {

                res.jsonp(results);
            });
        }
    });
};

/**
 * Shiny app middleware
 */
exports.shinyAppByID = function(req, res, next, id) {
    ShinyApp.findById(id).populate('user', 'displayName').exec(function(err, shinyApp) {
        if (err) return next(err);
        if (!shinyApp) return next(new Error('Failed to load Shiny app ' + id));

        req.shinyApp = shinyApp;
        next();
    });
};
//
// /**
//  * Shiny app authorization middleware
//  */
// exports.hasAuthorization = function(req, res, next) {
//     if (!req.user.id) {
//         return res.status(403).send('User is not authorized');
//     }
//     next();
// };
