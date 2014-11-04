'use strict';

var cron = require('cron'),
	mongoose = require('mongoose'),
	Task = mongoose.model('Task');


var startTask = function(task) {
	console.log(task);
	console.log('Starting: ' + task.name + '\nusing file ' + task.scriptOriginalFilename);

};


Task.find().sort('-created').populate('user', 'displayName').exec(function(err, results) {
	if (err) {
		console.log(err);
	} else {

		console.log(results);
		var t;
		for(t in results){
			startTask(t);
		}
		
	}
});





// module.export.tasks = tasks;
