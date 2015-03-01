'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Report = mongoose.model('Report'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, report;

/**
 * Report routes tests
 */
describe('Report CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Report
		user.save(function() {
			report = {
				name: 'Report Name',
                cron: '* * * * *'
			};

			done();
		});
	});

	it('should be able to save Report instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Report
				agent.post('/reports')
					.send(report)
					.expect(200)
					.end(function(reportSaveErr, reportSaveRes) {
						// Handle Report save error
						if (reportSaveErr) done(reportSaveErr);

						// Get a list of Reports
						agent.get('/reports')
							.end(function(reportsGetErr, reportsGetRes) {
								// Handle Report save error
								if (reportsGetErr) done(reportsGetErr);

								// Get Reports list
								var reports = reportsGetRes.body;

								// Set assertions
								(reports[0].user._id).should.equal(userId);
								(reports[0].name).should.match('Report Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Report instance if not logged in', function(done) {
		agent.post('/reports')
			.send(report)
			.expect(401)
			.end(function(reportSaveErr, reportSaveRes) {
				// Call the assertion callback
				done(reportSaveErr);
			});
	});

	it('should not be able to save Report instance if no name is provided', function(done) {
		// Invalidate name field
		report.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Report
				agent.post('/reports')
					.send(report)
					.expect(400)
					.end(function(reportSaveErr, reportSaveRes) {
						// Set message assertion
						(reportSaveRes.body.message).should.match('Please enter report name');
						
						// Handle Report save error
						done(reportSaveErr);
					});
			});
	});

	it('should be able to update Report instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Report
				agent.post('/reports')
					.send(report)
					.expect(200)
					.end(function(reportSaveErr, reportSaveRes) {
						// Handle Report save error
						if (reportSaveErr) done(reportSaveErr);

						// Update Report name
						report.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Report
						agent.put('/reports/' + reportSaveRes.body._id)
							.send(report)
							.expect(200)
							.end(function(reportUpdateErr, reportUpdateRes) {
								// Handle Report update error
								if (reportUpdateErr) done(reportUpdateErr);

								// Set assertions
								(reportUpdateRes.body._id).should.equal(reportSaveRes.body._id);
								(reportUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	//it('should be able to get a list of Reports if not signed in', function(done) {
	//	// Create new Report model instance
	//	var reportObj = new Report(report);
    //
	//	// Save the Report
	//	reportObj.save(function() {
	//		// Request Reports
	//		request(app).get('/reports')
	//			.end(function(req, res) {
	//				// Set assertion
	//				res.body.should.be.an.Array.with.lengthOf(1);
    //
	//				// Call the assertion callback
	//				done();
	//			});
    //
	//	});
	//});
    //
    //
	//it('should be able to get a single Report if not signed in', function(done) {
	//	// Create new Report model instance
	//	var reportObj = new Report(report);
    //
	//	// Save the Report
	//	reportObj.save(function() {
	//		request(app).get('/reports/' + reportObj._id)
	//			.end(function(req, res) {
	//				// Set assertion
	//				res.body.should.be.an.Object.with.property('name', report.name);
    //
	//				// Call the assertion callback
	//				done();
	//			});
	//	});
	//});

	it('should be able to delete Report instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Report
				agent.post('/reports')
					.send(report)
					.expect(200)
					.end(function(reportSaveErr, reportSaveRes) {
						// Handle Report save error
						if (reportSaveErr) done(reportSaveErr);

						// Delete existing Report
						agent.delete('/reports/' + reportSaveRes.body._id)
							.send(report)
							.expect(200)
							.end(function(reportDeleteErr, reportDeleteRes) {
								// Handle Report error error
								if (reportDeleteErr) done(reportDeleteErr);

								// Set assertions
								(reportDeleteRes.body._id).should.equal(reportSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Report instance if not signed in', function(done) {
		// Set Report user 
		report.user = user;

		// Create new Report model instance
		var reportObj = new Report(report);

		// Save the Report
		reportObj.save(function() {
			// Try deleting Report
			request(app).delete('/reports/' + reportObj._id)
			.expect(401)
			.end(function(reportDeleteErr, reportDeleteRes) {
				// Set message assertion
				(reportDeleteRes.body.message).should.match('User is not logged in');

				// Handle Report error error
				done(reportDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Report.remove().exec();
		done();
	});
});