'use strict';


var schedule = require('node-schedule'),
    mongoose = require('mongoose'),
    Report = mongoose.model('Report'),
    Log = mongoose.model('Log'),
    config = require('../../config/config'),
    mailer = require('../helpers/mailer'),
    fileCopy = require('../helpers/file.copy'),
    spawn = require('child_process').spawn,
    path = require('path'),
    temp = require('temp'),
    async = require('async'),
    fs = require('fs');

// Automatically track and cleanup files at exit
temp.track();

var runReport;
runReport = function(report){

    var log = new Log({
        task: report._id
    });


    var runScript;
    runScript = config.runRmarkdown;

    console.log('Running report: ' + report.name + ' -- from file: ' + report.scriptOriginalFilename);

    async.waterfall([
        function(callback){
            // create a temporary directory to run r files in
            temp.mkdir('scheduleR', function(err, dirPath){

                callback(err, dirPath);
            });

        },
        function(dirPath, callback){
            // determine arguments to Rscript

            var args = config.userConfig.RstandardArguments.concat(
                [runScript,
                    dirPath,
                    path.normalize(config.userConfig.uploadDir + '/' + report.scriptNewFilename),
                    report.arguments
                ]);

            // actually spawn the process
            var child = spawn(config.userConfig.RscriptExecutable, args);

            var resp = '';

            // push stderr / stdout to logs
            child.on('error', function(err) {
                console.log(err);
            });

            child.stdout.on('data', function(buffer) {
                resp += buffer.toString();

            });

            child.stderr.on('data', function(buffer) {
                resp += buffer.toString();

            });

            var errs;
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
            if(successfulExecution && report.mailOnSuccess.length > 0) {
                mailer.sendNotificationMail(
                    config.userConfig.mailer.from,
                    report.mailOnSuccess, {
                        name: report.name,
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
            else if(report.mailOnError.length > 0){
                // if !successfulExecution send error notification mail
                mailer.sendNotificationMail(
                    config.userConfig.mailer.from,
                    report.mailOnError, {
                        name: report.name,
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

            callback(errs, dirPath, successfulExecution);

        },
        function(dirPath, successfulExecution, callback){

            /////////
            // rename generated files to match original Rmd file basename
            ////////
            var originalBaseFilename = path.basename(report.scriptOriginalFilename, path.extname(report.scriptOriginalFilename));
            var scriptBaseFilename = path.basename(report.scriptNewFilename, path.extname(report.scriptNewFilename));

            // only rename resulting html and pdf file with generated base filename
            var fileFilter = [scriptBaseFilename.toLowerCase() + '.html', scriptBaseFilename.toLowerCase() + '.pdf'];
            var files = fs.readdirSync(dirPath)
                .filter(function (f) {
                    return fileFilter.indexOf(f.toLowerCase()) >= 0;
                });

            for (var i = 0; i < files.length; i++) {
                var newFilePath;
                // add timestamp to filename if requested
                if (report.RmdFilenameTimestamp === true) {
                    var timestamp = new Date().toISOString().replace(/\..+/, '').replace(/:/g, '');
                    newFilePath = dirPath + '/' + originalBaseFilename + '_' + timestamp + path.extname(files[i]);
                } else {
                    newFilePath = dirPath + '/' + originalBaseFilename + path.extname(files[i]);
                }

                fs.renameSync(dirPath + '/' + files[i], newFilePath);
            }

            if(successfulExecution && report.mailRmdReport.length>0) {

                ////////
                // send report to onsuccess adresses
                ////////

                mailer.sendRmarkdownMail(config.userConfig.mailer.from,
                    report.mailRmdReport, {
                        name: report.name,
                        msg: report.RmdAccompanyingMsg
                    },
                    dirPath,
                    function (err) {
                        log.msg = log.msg + '\n\n==> Mail error (not R related):\n' + err.toString();
                        log.success = false;
                        log.save(function (err) {
                            if (err) console.log(err);
                        });
                    });
            }
            //////
            // copy files to specified dir
            //////

            if (report.RmdOutputPath) {
                fileCopy(dirPath, report.RmdOutputPath, function(err) {
                    if (err) {
                        console.log(err);
                        log.msg = log.msg + '\n\n==> File copy error (not R related):\n' + err.toString();
                        log.success = false;
                        log.save(function(err) {
                            if (err) console.log(err);
                        });
                    }
                });

            }

        }
    ], function(err){
        if(err) console.log(err);
        temp.cleanup(function(err, stats) {
            //console.log(stats);
            if(err) console.log(err);
        });

    });

};

var startJob;
startJob = function(report){
    return(
        new schedule.scheduleJob(report.cron, function(){
                runReport(report);
            })
    );
};


var reportlist = function() {
    this.reports = {};
    this.addReportAndStart = function(report) {
        this.reports[report._id] = startJob(report);
    };
    this.runReportOnce = function(report) {
        runReport(report);
    };
    this.removeReport = function(report) {
        this.stopReport(report);
        delete this.reports[report._id];

    };
    this.stopReport = function(report) {
        if (report._id in this.reports) this.reports[report._id].cancel();
    };
    this.stopAllReports = function() {
        for (var reportId in this.reports) {
            this.reports[reportId].cancel();
        }
    };
    this.startAllReports = function() {
        for (var reportId in this.reports) {
            this.reports[reportId].start();
        }
    };
    this.restart = function() {
        this.stopAllReports();
        this.startAllReports();
    };

    this.numberOfEnabledReports = function() {
        var key,
            count = 0;

        for (key in this.reports) {
            if (this.reports[key].running) count++;
        }

        return (count);
    };

};

var ReportList = new reportlist();
module.exports = ReportList;

// find enabled tasks in database and actually enable 'em
Report.find({
    'enabled': true
}).sort('-created').populate('user', 'displayName').exec(function(err, reports) {
    if (err) {
        console.log(err);
    } else {

        for (var i = 0; i < reports.length; i++) {

            var report = reports[i];
            ReportList.addReportAndStart(report);

        }
    }
});
