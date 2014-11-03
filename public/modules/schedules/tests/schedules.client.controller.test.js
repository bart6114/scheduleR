'use strict';

(function() {
	// Schedules Controller Spec
	describe('Schedules Controller Tests', function() {
		// Initialize global variables
		var SchedulesController,
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

			// Initialize the Schedules controller.
			SchedulesController = $controller('SchedulesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Schedule object fetched from XHR', inject(function(Schedules) {
			// Create sample Schedule using the Schedules service
			var sampleSchedule = new Schedules({
				name: 'New Schedule'
			});

			// Create a sample Schedules array that includes the new Schedule
			var sampleSchedules = [sampleSchedule];

			// Set GET response
			$httpBackend.expectGET('schedules').respond(sampleSchedules);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.schedules).toEqualData(sampleSchedules);
		}));

		it('$scope.findOne() should create an array with one Schedule object fetched from XHR using a scheduleId URL parameter', inject(function(Schedules) {
			// Define a sample Schedule object
			var sampleSchedule = new Schedules({
				name: 'New Schedule'
			});

			// Set the URL parameter
			$stateParams.scheduleId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/schedules\/([0-9a-fA-F]{24})$/).respond(sampleSchedule);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.schedule).toEqualData(sampleSchedule);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Schedules) {
			// Create a sample Schedule object
			var sampleSchedulePostData = new Schedules({
				name: 'New Schedule'
			});

			// Create a sample Schedule response
			var sampleScheduleResponse = new Schedules({
				_id: '525cf20451979dea2c000001',
				name: 'New Schedule'
			});

			// Fixture mock form input values
			scope.name = 'New Schedule';

			// Set POST response
			$httpBackend.expectPOST('schedules', sampleSchedulePostData).respond(sampleScheduleResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Schedule was created
			expect($location.path()).toBe('/schedules/' + sampleScheduleResponse._id);
		}));

		it('$scope.update() should update a valid Schedule', inject(function(Schedules) {
			// Define a sample Schedule put data
			var sampleSchedulePutData = new Schedules({
				_id: '525cf20451979dea2c000001',
				name: 'New Schedule'
			});

			// Mock Schedule in scope
			scope.schedule = sampleSchedulePutData;

			// Set PUT response
			$httpBackend.expectPUT(/schedules\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/schedules/' + sampleSchedulePutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid scheduleId and remove the Schedule from the scope', inject(function(Schedules) {
			// Create new Schedule object
			var sampleSchedule = new Schedules({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Schedules array and include the Schedule
			scope.schedules = [sampleSchedule];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/schedules\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleSchedule);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.schedules.length).toBe(0);
		}));
	});
}());