'use strict';


var cron = require('cron'),
	mongoose = require('mongoose'),
	Task = mongoose.model('Task'),
	Log = mongoose.model('Log'),
	config = require('../../config/config'),
	mailer = require('../mailer/mailer'),
	CronJob = require('cron').CronJob,
	spawn = require('child_process').spawn,
	path = require('path'),
	temp = require('temp'),
	fs = require('fs');

// Automatically track and cleanup files at exit
temp.track();

var start_job = function(task) {

	var job = new CronJob(task.cron, function(){

			var runScript;
			if(task.Rmarkdown) {
				runScript = config.userConfig.runRmarkdown;

			} else {
				runScript = config.userConfig.runRscript;
			}

			console.log('Running task: ' + task.name + ' -- from file: ' + task.scriptOriginalFilename);


			var resp = '';
			var log = new Log({task: task._id});


			temp.mkdir('scheduleR', function(err, dirPath) {

				var args = config.userConfig.RstandardArguments.concat(
					[runScript,
						dirPath,
						path.normalize(config.userConfig.uploadDir + '/' + task.scriptNewFilename),
						task.arguments]);

				var child = spawn(config.userConfig.RscriptExecutable, args);


				child.on('error', function(err) {
					console.log(err);
				});

				child.stdout.on('data', function (buffer) {
					resp += buffer.toString();

				});

				child.stdout.on('end', function() {
					log.msg = resp;

					log.save(function(err){
						if(err) console.log(err);
					});
				});

				child.on('exit', function (code) {

					if(code === 1){
						log.success = false;
						log.save(function(err){
							if(err) console.log(err);
						});

						mailer(config.userConfig.mailSettings.from,
							task.mailOnError,
							'Unsuccesful execution of script: ' + task.name,
							"Task: "  + task.name +
							"\nDescription: " + task.description +
							"\nExecuted at: " + log.created,
							null);

					} else {
						if(task.Rmarkdown) {
							mailer(config.userConfig.mailSettings.from,
								task.mailOnSuccess,
								task.name,
								task.RmdAccompanyingMsg,
								dirPath);
						} else {
							mailer(config.userConfig.mailSettings.from,
								task.mailOnSuccess,
								'Successful execution: ' + task.name,
								"Task: "  + task.name +
								"\nDescription: " + task.description +
								"\nExecuted at: " + log.created,
								null);
						}

					}

				});

			});



		},
		null,
		true);

	return(job);


};

function tasklist() {
	this.tasks = {};
	this.addTaskAndStart = function(task){
		this.tasks[task._id] = start_job(task);
	};
	this.removeTask = function(task){
		this.stopTask(task);
		delete this.tasks[task._id];

	};
	this.stopTask = function(task){
		this.tasks[task._id].stop();
	};
	this.stopAllTasks = function(){
		for(var taskId in this.tasks){
			this.tasks[taskId].stop();
		}
	};
	this.startAllTasks = function(){
		for(var taskId in this.tasks){
			this.tasks[taskId].start();
		}
	};
	this.restart = function(){
		this.stopAllTasks();
		this.startAllTasks();
	}
}

var TaskList = new tasklist();
module.exports = TaskList;


Task.find({'enabled': true}).sort('-created').populate('user', 'displayName').exec(function(err, tasks) {
	if (err) {
		console.log(err);
	} else {

		for(var i= 0; i<tasks.length; i++) {

			var task = tasks[i];
			TaskList.addTaskAndStart(task);



		}
	}
});
