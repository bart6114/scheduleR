'use strict';

var cron = require('cron'),
	mongoose = require('mongoose'),
	Task = mongoose.model('Task'),
	config = require('../../config/config'),
	CronJob = require('cron').CronJob,
	spawn = require('child_process').spawn,
	path = require('path');


function run_cmd(cmd, args, callBack ) {

	console.log(cmd, args);
	var child = spawn(cmd, args);
	var resp = '';


	child.on('error', function(err) {
		console.log(err);
	});

	child.stdout.on('data', function (buffer) { resp += buffer.toString(); });
	child.stdout.on('end', function() { callBack (resp); });

}


var startTask = function(task) {
	console.log(task);
	console.log('Starting: ' + task.name + ' -- using file ' + task.filename + ' -- ' + task.cron);
	new CronJob(task.cron, function(){
			//console.log('Current directory: ' + process.cwd());
			run_cmd(config.Rscript,
				['--verbose', config.runScript, task.filename, task.arguments],
				function(text) {
					console.log (text);
				});

		},
		null,
		true);

};


Task.find().sort('-created').populate('user', 'displayName').exec(function(err, tasks) {
	if (err) {
		console.log(err);
	} else {

		for(var i= 0; i<tasks.length; i++) {
			console.log(tasks[i]);
			startTask(tasks[i]);
		}

	}
});





// module.export.tasks = tasks;
