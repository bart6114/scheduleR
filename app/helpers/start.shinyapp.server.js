'use strict';

var cron = require('cron'),
    mongoose = require('mongoose'),
    ShinyApp = mongoose.model('ShinyApp'),
    Log = mongoose.model('Log'),
    config = require('../../config/config'),
    // mailer = require('../helpers/mailer'),
    // fileCopy = require('../helpers/file.copy'),
    // CronJob = require('cron').CronJob,
    spawn = require('child_process').spawn,
    path = require('path'),
    temp = require('temp'),
    async = require('async'),
    fs = require('fs');


function randomIntInc(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}


var startApp = function(shinyApp, port) {

    async.waterfall([
            function(callback) {

                var args = config.userConfig.RstandardArguments.concat(
                    [config.runShiny,
                        path.normalize(config.userConfig.uploadDir + '/' + shinyApp.packageNewFilename),
                        port
                    ]);
                console.log('args', args);
                var child = spawn(config.userConfig.RscriptExecutable, args, {maxBuffer: 200*10000});

                // var resp = '';
                //
                // child.on('error', function(err) {
                //     console.log(err);
                // });
                //
                // child.stdout.on('data', function(buffer) {
                //     console.log(buffer.toString());
                //     resp += buffer.toString();
                //
                // });
                //
                // child.stderr.on('data', function(buffer) {
                //     console.log(buffer.toString());
                //     resp += buffer.toString();
                //
                // });
                //
                //
                // child.stdout.on('end', function() {
                //     // log.msg = resp;
                //     //
                //     // log.save(function(err) {
                //     //     if (err) console.log(err);
                //     // });
                //     console.log(resp);
                // });

                callback(child);


            }
        ],
        function(err, result) {
            //console.log(err, result);
        });

};

var ShinyAppList = function() {
    this.apps = {};

    this.addApp = function(shinyApp) {
        this.apps[shinyApp._id] = {
            shinyApp: shinyApp,
            running: true
        };
        var port = randomIntInc(4000, 8000);
        startApp(shinyApp, port);
    };

    this.startApp = function(shinyApp) {

        startApp(this.apps[shinyApp._id].shinyApp);
        this.apps[shinyApp._id].running = true;
    };
};

var shinyAppList = new ShinyAppList();
module.exports = shinyAppList;
