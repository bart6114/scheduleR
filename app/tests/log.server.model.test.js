'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Log = mongoose.model('Log'),
	Task = mongoose.model('Task');

/**
 * Globals
 */
var user, log, task;

/**
 * Unit tests
 */
describe('Log Model Unit Tests:', function() {
	beforeEach(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password'
		});

		user.save(function() {
			task = new Task({
				name: 'Task Name',
				user: user
			});
			task.save(function(){
				log = new Log({msg: 'test message',
					task: task._id});
			});


			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return log.save(function(err) {
				should.not.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) {
		Log.remove().exec();
		User.remove().exec();

		done();
	});
});