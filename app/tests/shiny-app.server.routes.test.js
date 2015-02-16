'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	ShinyApp = mongoose.model('ShinyApp'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, shinyApp;

/**
 * Shiny app routes tests
 */
describe('Shiny app CRUD tests', function() {
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

		// Save a user to the test db and create new Shiny app
		user.save(function() {
			shinyApp = {
				name: 'Shiny app Name'
			};

			done();
		});
	});

	it('should be able to save Shiny app instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Shiny app
				agent.post('/shiny-apps')
					.send(shinyApp)
					.expect(200)
					.end(function(shinyAppSaveErr, shinyAppSaveRes) {
						// Handle Shiny app save error
						if (shinyAppSaveErr) done(shinyAppSaveErr);

						// Get a list of Shiny apps
						agent.get('/shiny-apps')
							.end(function(shinyAppsGetErr, shinyAppsGetRes) {
								// Handle Shiny app save error
								if (shinyAppsGetErr) done(shinyAppsGetErr);

								// Get Shiny apps list
								var shinyApps = shinyAppsGetRes.body;

								// Set assertions
								(shinyApps[0].user._id).should.equal(userId);
								(shinyApps[0].name).should.match('Shiny app Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Shiny app instance if not logged in', function(done) {
		agent.post('/shiny-apps')
			.send(shinyApp)
			.expect(401)
			.end(function(shinyAppSaveErr, shinyAppSaveRes) {
				// Call the assertion callback
				done(shinyAppSaveErr);
			});
	});

	it('should not be able to save Shiny app instance if no name is provided', function(done) {
		// Invalidate name field
		shinyApp.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Shiny app
				agent.post('/shiny-apps')
					.send(shinyApp)
					.expect(400)
					.end(function(shinyAppSaveErr, shinyAppSaveRes) {
						// Set message assertion
						(shinyAppSaveRes.body.message).should.match('Please fill Shiny app name');
						
						// Handle Shiny app save error
						done(shinyAppSaveErr);
					});
			});
	});

	it('should be able to update Shiny app instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Shiny app
				agent.post('/shiny-apps')
					.send(shinyApp)
					.expect(200)
					.end(function(shinyAppSaveErr, shinyAppSaveRes) {
						// Handle Shiny app save error
						if (shinyAppSaveErr) done(shinyAppSaveErr);

						// Update Shiny app name
						shinyApp.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Shiny app
						agent.put('/shiny-apps/' + shinyAppSaveRes.body._id)
							.send(shinyApp)
							.expect(200)
							.end(function(shinyAppUpdateErr, shinyAppUpdateRes) {
								// Handle Shiny app update error
								if (shinyAppUpdateErr) done(shinyAppUpdateErr);

								// Set assertions
								(shinyAppUpdateRes.body._id).should.equal(shinyAppSaveRes.body._id);
								(shinyAppUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Shiny apps if not signed in', function(done) {
		// Create new Shiny app model instance
		var shinyAppObj = new ShinyApp(shinyApp);

		// Save the Shiny app
		shinyAppObj.save(function() {
			// Request Shiny apps
			request(app).get('/shiny-apps')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Shiny app if not signed in', function(done) {
		// Create new Shiny app model instance
		var shinyAppObj = new ShinyApp(shinyApp);

		// Save the Shiny app
		shinyAppObj.save(function() {
			request(app).get('/shiny-apps/' + shinyAppObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', shinyApp.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Shiny app instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Shiny app
				agent.post('/shiny-apps')
					.send(shinyApp)
					.expect(200)
					.end(function(shinyAppSaveErr, shinyAppSaveRes) {
						// Handle Shiny app save error
						if (shinyAppSaveErr) done(shinyAppSaveErr);

						// Delete existing Shiny app
						agent.delete('/shiny-apps/' + shinyAppSaveRes.body._id)
							.send(shinyApp)
							.expect(200)
							.end(function(shinyAppDeleteErr, shinyAppDeleteRes) {
								// Handle Shiny app error error
								if (shinyAppDeleteErr) done(shinyAppDeleteErr);

								// Set assertions
								(shinyAppDeleteRes.body._id).should.equal(shinyAppSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Shiny app instance if not signed in', function(done) {
		// Set Shiny app user 
		shinyApp.user = user;

		// Create new Shiny app model instance
		var shinyAppObj = new ShinyApp(shinyApp);

		// Save the Shiny app
		shinyAppObj.save(function() {
			// Try deleting Shiny app
			request(app).delete('/shiny-apps/' + shinyAppObj._id)
			.expect(401)
			.end(function(shinyAppDeleteErr, shinyAppDeleteRes) {
				// Set message assertion
				(shinyAppDeleteRes.body.message).should.match('User is not logged in');

				// Handle Shiny app error error
				done(shinyAppDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		ShinyApp.remove().exec();
		done();
	});
});