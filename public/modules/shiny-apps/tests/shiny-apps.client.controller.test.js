'use strict';

(function() {
	// Shiny apps Controller Spec
	describe('Shiny apps Controller Tests', function() {
		// Initialize global variables
		var ShinyAppsController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Shiny apps controller.
			ShinyAppsController = $controller('ShinyAppsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Shiny app object fetched from XHR', inject(function(ShinyApps) {
			// Create sample Shiny app using the Shiny apps service
			var sampleShinyApp = new ShinyApps({
				name: 'New Shiny app'
			});

			// Create a sample Shiny apps array that includes the new Shiny app
			var sampleShinyApps = [sampleShinyApp];

			// Set GET response
			$httpBackend.expectGET('shiny-apps').respond(sampleShinyApps);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.shinyApps).toEqualData(sampleShinyApps);
		}));

		it('$scope.findOne() should create an array with one Shiny app object fetched from XHR using a shinyAppId URL parameter', inject(function(ShinyApps, LogsArray) {
			// Define a sample Shiny app object
			var sampleShinyApp = new ShinyApps({
				name: 'New Shiny app',
                urlSuffix: 'testurl'
			});

            var sampleLog = new LogsArray([{
                msg: 'test',
                task: sampleShinyApp._id
            }]);

			// Set the URL parameter
			$stateParams.shinyAppId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/shiny-apps\/([0-9a-fA-F]{24})$/).respond(sampleShinyApp);
            $httpBackend.expectGET(/logs\/list\?maxNumberOfLogs=5&startAt=0$/).respond([sampleLog]); // should usually contain id but isn't know at testing

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.shinyApp).toEqualData(sampleShinyApp);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(ShinyApps) {
			// Create a sample Shiny app object
			var sampleShinyAppPostData = new ShinyApps({
				name: 'New Shiny app',
				urlSuffix: 'testurl'
			});

			// Create a sample Shiny app response
			var sampleShinyAppResponse = new ShinyApps({
				_id: '525cf20451979dea2c000001',
				name: 'New Shiny app',
				urlSuffix: 'testurl'
			});

			// Fixture mock form input values
			scope.name = 'New Shiny app';
			scope.shinyApp = sampleShinyAppPostData; // (includes urlSuffix)

			// Set POST response
			$httpBackend.expectPOST('shiny-apps', sampleShinyAppPostData).respond(sampleShinyAppResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Shiny app was created
			expect($location.path()).toBe('/shiny-apps/' + sampleShinyAppResponse._id);
		}));

		it('$scope.update() should update a valid Shiny app', inject(function(ShinyApps) {
			// Define a sample Shiny app put data
			var sampleShinyAppPutData = new ShinyApps({
				_id: '525cf20451979dea2c000001',
				name: 'New Shiny app'
			});

			// Mock Shiny app in scope
			scope.shinyApp = sampleShinyAppPutData;

			// Set PUT response
			$httpBackend.expectPUT(/shiny-apps\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/shiny-apps/' + sampleShinyAppPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid shinyAppId and remove the Shiny app from the scope', inject(function(ShinyApps) {
			// Create new Shiny app object
			var sampleShinyApp = new ShinyApps({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Shiny apps array and include the Shiny app
			scope.shinyApps = [sampleShinyApp];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/shiny-apps\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleShinyApp);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.shinyApps.length).toBe(0);
		}));
	});
}());
