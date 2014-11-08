'use strict';

var cron = require('cron'),
	mongoose = require('mongoose'),
	Task = mongoose.model('Task'),
	Log = mongoose.model('Log'),
	config = require('../../config/config'),
	CronJob = require('cron').CronJob,
	spawn = require('child_process').spawn,
	path = require('path');


var start_job = function(task) {

	var job = new CronJob(task.cron, function(){



		console.log('Running task: ' + task.name + ' -- from file: ' + task.scriptOriginalFilename);
		var args = config.RstandardArguments.concat(
			[config.runRscript,
				path.normalize(config.uploadDir + '/' + task.scriptNewFilename),
				task.arguments]);

		var resp = '';
		var log = new Log({task: task._id});
		var child = spawn(config.Rscript, args);
		

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
			}

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
	this.removeTask = function(taskId){

		this.stopTask(taskId);
		delete this.tasks[taskId];

	};
	this.stopTask = function(taskId){
		this.tasks[taskId].stop();
	};
	this.stopAllTasks = function(){
		for(var task in this.tasks){
			this.tasks[task].stop();
		}
	};
	this.startAllTasks = function(){
		for(var task in this.tasks){
			this.tasks[task].start();
		}
	};
	this.restart = function(){
		this.stopAllTasks();
		this.startAllTasks();
	}
}

var TaskList = new tasklist();

Task.find({'enabled': true}).sort('-created').populate('user', 'displayName').exec(function(err, tasks) {
	if (err) {
		console.log(err);
	} else {

		for(var i= 0; i<tasks.length; i++) {

			var task = tasks[i];
			TaskList.addTaskAndStart(task);
			//taskList[task._id] = start_job(task);


		}

	}



});

module.export = TaskList;
