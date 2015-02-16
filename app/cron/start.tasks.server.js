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

var run_task = function(task) {
  var runScript;
  if (task.Rmarkdown) {
    runScript = config.runRmarkdown;

  } else {
    runScript = config.runRscript;
  }

  console.log('Running task: ' + task.name + ' -- from file: ' + task.scriptOriginalFilename);


  var resp = '';
  var log = new Log({
    task: task._id
  });


  temp.mkdir('scheduleR', function(err, dirPath) {

    var args = config.userConfig.RstandardArguments.concat(
      [runScript,
        dirPath,
        path.normalize(config.userConfig.uploadDir + '/' + task.scriptNewFilename),
        task.arguments
      ]);

    var child = spawn(config.userConfig.RscriptExecutable, args);


    child.on('error', function(err) {
      console.log(err);
    });

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
      });
    });

    child.on('exit', function(code) {

      // if unsuccessful execution
      if (code !== 0) {
        log.success = false;
        log.save(function(err) {
          if (err) console.log(err);
        });

        // send error notification

        mailer.sendNotificationMail(
          config.userConfig.mailer.from,
          task.mailOnError, {
            name: task.name,
            status: log.success,
            time: log.created,
            log: log.msg
          },
          function(err) {
            log.msg = log.msg + '\n\n==> Mail error (not R related):\n' + err.toString();
            log.save(function(err) {
              if (err) console.log(err);
            });
          });

      } else {


        // send success notification
        mailer.sendNotificationMail(
          config.userConfig.mailer.from,
          task.mailOnSuccess, {
            name: task.name,
            status: log.success,
            time: log.created,
            log: log.msg
          },
          function(err) {
            log.msg = log.msg + '\n\n==> Mail error (not R related):\n' + err.toString();
            log.success = false;
            log.save(function(err) {
              if (err) console.log(err);
            });
          });



        if (task.Rmarkdown) { // TODO: move this to async approach?
          // rename generated files to match original Rmd file basename
          var originalBaseFilename = path.basename(task.scriptOriginalFilename, path.extname(task.scriptOriginalFilename));
          var scriptBaseFilename = path.basename(task.scriptNewFilename, path.extname(task.scriptNewFilename));

          // only rename resulting html and pdf file with generate base filename
          var fileFilter = [scriptBaseFilename.toLowerCase() + '.html', scriptBaseFilename.toLowerCase() + '.pdf'];
          var files = fs.readdirSync(dirPath)
            .filter(function(f) {
              return fileFilter.indexOf(f.toLowerCase()) >= 0;
            });

          for (var i = 0; i < files.length; i++) {
	    var newFilePath;
	    // add timestamp to filename if requested
            if (task.RmdFilenameTimestamp === true) {
	      var timestamp = new Date().toISOString().replace(/\..+/, '').replace(/:/g, '');
	      newFilePath = dirPath + '/' + originalBaseFilename + '_' + timestamp + path.extname(files[i]);
            } else {
              newFilePath = dirPath + '/' + originalBaseFilename + path.extname(files[i]);
            }

            fs.renameSync(dirPath + '/' + files[i], newFilePath);
          }


          // send report to onsuccess adresses
          mailer.sendRmarkdownMail(config.userConfig.mailer.from,
            task.mailRmdReport, {
              name: task.name,
              msg: task.RmdAccompanyingMsg
            },
            dirPath,
            function(err) {
              log.msg = log.msg + '\n\n==> Mail error (not R related):\n' + err.toString();
              log.success = false;
              log.save(function(err) {
                if (err) console.log(err);
              });
            });


          // copy files to specified dir
          if (task.RmdOutputPath) {
            fileCopy(dirPath, task.RmdOutputPath, function(err) {
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

      }

    });

  });

};

var start_job = function(task) {

  var job = new CronJob(task.cron, function() {
      run_task(task);
    },
    null,
    true);

  return (job);
};

var tasklist = function() {
  this.tasks = {};
  this.addTaskAndStart = function(task) {
    this.tasks[task._id] = start_job(task);
  };
  this.runTaskOnce = function(task) {
    run_task(task);
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
};

var TaskList = new tasklist();
module.exports = TaskList;


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
