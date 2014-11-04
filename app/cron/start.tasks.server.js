'use strict';

var cron = require('cron'),
	mongoose = require('mongoose'),
	Task = mongoose.model('Task'),
	Log = mongoose.model('Log'),
	config = require('../../config/config'),
	CronJob = require('cron').CronJob,
	spawn = require('child_process').spawn,
	path = require('path');


var run_cmd = function(task, cmd, args, callBack ) {

	console.log('Running task: ' + task.name + ' -- from file: ' + task.filename);
	var child = spawn(cmd, args);
	var resp = '';
	var log = new Log({task: task._id});

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

};


var startTask = function(task) {



};


Task.find({'enabled': true}).sort('-created').populate('user', 'displayName').exec(function(err, tasks) {
	if (err) {
		console.log(err);
	} else {

		for(var i= 0; i<tasks.length; i++) {
			console.log(tasks[i]);

			var task = tasks[i];

			new CronJob(task.cron, function(){

					run_cmd(task, config.Rscript,
						['--verbose', config.runScript, task.filename, task.arguments],
						function(output) {
							console.log (output);
						}
					);
				},
				null,
				true);

		}

	}
});





// module.export.tasks = tasks;
