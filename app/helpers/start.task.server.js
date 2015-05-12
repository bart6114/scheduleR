'use strict';


var cron = require('cron'),
    mongoose = require('mongoose'),
    Task = mongoose.model('Task'),
    Log = mongoose.model('Log'),
    config = require('../../config/config'),
    mailer = require('../helpers/mailer'),
    fileCopy = require('../helpers/file.copy'),
    CronJob = require('cron').CronJob,
    spawn = require('child_process').spawn,
    path = require('path'),
    temp = require('temp'),
    async = require('async'),
    fs = require('fs');

// Automatically track and cleanup files at exit
temp.track();

var runTask;
runTask = function(task, lock){

    lock(true);

    var log = new Log({
        task: task._id
    });


    var runScript;
    runScript = config.runRscript;

    console.log('Running task: ' + task.name + ' -- from file: ' + task.scriptOriginalFilename);

    async.waterfall([
        function(callback){
            // create a temporary directory to run r files in
            temp.mkdir('scheduleR', function(err, dirPath){

                callback(err, dirPath);
            });
            //callback(err, 4);

        },
        function(dirPath, callback){
            // determine arguments to Rscript

            var args = config.userConfig.RstandardArguments.concat(
                [runScript,
                    dirPath,
                    path.normalize(config.userConfig.uploadDir + '/' + task.scriptNewFilename),
                    task.arguments
                ]);

            // actually spawn the process
            var child = spawn(config.userConfig.RscriptExecutable, args);

            var resp = '';

            // push stderr / stdout to logs
            child.on('error', function(err) {
                console.log(err);

            });
            var errs;
            child.stdout.on('data', function(buffer) {
                resp += buffer.toString();

            });

            child.stderr.on('data', function(buffer) {
                resp += buffer.toString();

            });

            child.stdout.on('end', function() {
                log.msg = resp;

                log.save(function(err) {
                    if (err) console.log(err);
                    errs = err;

                });
            });

            child.on('exit', function(code) {

                // if unsuccessful execution
                if (code !== 0) {
                    log.success = false;

                    log.save(function (err) {
                        if (err) console.log(err);
                    });

                    callback(errs, dirPath, false);
                } else {
                    callback(errs, dirPath, true);
                }
            });

        },
        function(dirPath, successfulExecution, callback){
            var errs;

            // if successfulExecution send success notification mail
            if(successfulExecution) {
                mailer.sendNotificationMail(
                    config.userConfig.mailer.from,
                    task.mailOnSuccess, {
                        name: task.name,
                        status: log.success,
                        time: log.created,
                        log: log.msg
                    },
                    function(err) {
                        log.msg += '\n\n==> Mail error (not R related):\n' + err.toString();
                        log.success = false;
                        log.save(function(err) {
                            if (err) console.log(err);
                            errs = err;
                        });
                    });

            }
            else {
                // if !successfulExecution send error notification mail
                mailer.sendNotificationMail(
                    config.userConfig.mailer.from,
                    task.mailOnError, {
                        name: task.name,
                        status: log.success,
                        time: log.created,
                        log: log.msg
                    },
                    function (err) {
                        log.msg += '\n\n==> Mail error (not R related):\n' + err.toString();
                        log.save(function (err) {
                            if (err) console.log(err);
                            errs = err;
                        });
                    });

            }

            callback(errs);

        }
    ], function(err){
        if(err) console.log(err);
        temp.cleanup(function(err, stats) {
            //console.log(stats);
            if(err) console.log(err);
        });

        lock(false);

    });


};

var startJob;
startJob = function(task, lock, isLocked){

    return(
        new CronJob(task.cron, function(){
                if(!isLocked(task) || task.ignoreLock) runTask(task, lock);
            },
            null,
            true)
    );

};


var tasklist = function() {
    var parent = this;
    this.tasks = {};
    this.lockedTasks = [];

    this.lock = function(task, locked) {
        if(locked){
            this.lockedTasks.push(task._id);
        }
        else {
            var i = this.lockedTasks.indexOf(task._id);
            if(i > -1) this.lockedTasks.splice(i, 1);
        }

    };

    this.isLocked = function(task){
        return this.lockedTasks.indexOf(task._id) > -1 ? true : false;

    };

    this.addTaskAndStart = function(task) {
        this.tasks[task._id] = startJob(task, function(locked){
            parent.lock(task, locked);
        }, function(task){
            return parent.isLocked(task);
        });
    };

    this.runTaskOnce = function(task) {
        if(!this.isLocked(task) || task.ignoreLock) {
            runTask(task, function (locked) {
                parent.lock(task, locked);
            });
        }
    };

    this.removeTask = function(task) {
        this.stopTask(task);
        delete this.tasks[task._id];

    };
    this.stopTask = function(task) {
        if (task._id in this.tasks) this.tasks[task._id].stop();
    };
    this.stopAllTasks = function() {
        for (var taskId in this.tasks) {
            this.tasks[taskId].stop();
        }
    };
    this.startAllTasks = function() {
        for (var taskId in this.tasks) {
            this.tasks[taskId].start();
        }
    };
    this.restart = function() {
        this.stopAllTasks();
        this.startAllTasks();
    };

    this.numberOfEnabledTasks = function() {
        var key,
            count = 0;

        for (key in this.tasks) {
            if (this.tasks[key].running) count++;
        }



        return (count);
    };

};

var TaskList = new tasklist();
module.exports = TaskList;


// find enabled tasks in database and actually enable 'em
Task.find({
    'enabled': true
}).sort('-created').populate('user', 'displayName').exec(function(err, tasks) {
    if (err) {
        console.log(err);
    } else {

        for (var i = 0; i < tasks.length; i++) {

            var task = tasks[i];
            TaskList.addTaskAndStart(task);



        }
    }
});