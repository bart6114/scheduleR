'use strict';

var cron = require('cron'),
    net = require('net'),
    mongoose = require('mongoose'),
    ShinyApp = mongoose.model('ShinyApp'),
    Log = mongoose.model('Log'),
    config = require('../../config/config'),
    spawn = require('child_process').spawn,
    path = require('path'),
    temp = require('temp'),
    async = require('async'),
    fs = require('fs');


function randomIntInc(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}


var startApp = function(shinyApp, port, callback) {

    var log = new Log({
        task: shinyApp._id
    });


    var args = config.userConfig.RstandardArguments.concat(
        [config.runShiny,
            path.normalize(config.userConfig.uploadDir + '/' + shinyApp.packageNewFilename),
            port
        ]);


    var child = spawn(config.userConfig.RscriptExecutable, args, {
        detached: true
    });

    var resp = '';

    child.on('error', function(err) {
        log.success = false;

        resp += err.toString();

        log.msg = resp;
        log.save(function(err) {
            if (err) callback(err);
        });

        callback(undefined, err);
    });

    child.stdout.on('data', function(buffer) {
        resp += buffer.toString();

        log.msg = resp;
        log.save(function(err) {
            if (err) callback(err);
        });


    });

    child.stderr.on('data', function(buffer) {

        resp += buffer.toString();
        log.msg = resp;
        log.save(function(err) {
            if (err) callback(err);
        });


    });


    child.stdout.on('end', function() {
        log.msg = resp;

        log.save(function(err) {
            if (err) {
                console.log(err);
                callback(undefined, err);
            }
        });

    });

    callback(child);




};

var ShinyAppList = function() {
    this.apps = {};

    this.startApp = function(shinyApp, callback) {
        console.log('Starting app: ' + shinyApp.name);
        // check if app already running
        // if so stop and delete from list

        if (shinyApp._id in this.apps) {
            this.stopApp(shinyApp._id);

        }

        // start (new instance)

        var port = randomIntInc(8000, 10000);

        this.apps[shinyApp._id] = {
            shinyApp: shinyApp,
            port: port
        };

        var parent = this;

        startApp(shinyApp, port, function(child, err) {

            if (err) parent.apps[shinyApp._id].running = false;

            else {
                parent.apps[shinyApp._id].running = true;
                parent.apps[shinyApp._id].child = child;
            }

            callback(port, err);
        });
    };

    this.stopApp = function(shinyApp) {
        console.log('Stopping app: ' + shinyApp.name);
        if (shinyApp._id in this.apps) {
            try {
                this.apps[shinyApp._id].child.kill();
            }
            catch(err){
                console.log('Problem killing process: ' + shinyApp.name);
            }
            delete this.apps[shinyApp._id];
        }
    };

    this.isRunning = function(shinyApp) {
        if (shinyApp._id in this.apps){

            var appList = this;

            var client = net.connect({port: this.apps[shinyApp._id].port},
                function() { //'connect' listener
                    //console.log('client connected');
                    client.end();
                });

            client.on('error', function(err){
                console.log('client not running');
                appList.stopApp(shinyApp);
                return false;
            });

            return true;

        }
        else return false;
    };

    this.numberOfRunningApps = function() {
        return (Object.keys(this.apps).length);
    };

    this.getAppPort = function(urlSuffix, callback) {
        var key;

        for (key in this.apps) {
            if (this.apps[key].shinyApp.urlSuffix === urlSuffix) {
                callback(this.apps[key].port);
                return;
            }
        }
        callback();


    };

};

var shinyAppList = new ShinyAppList();
module.exports = shinyAppList;
