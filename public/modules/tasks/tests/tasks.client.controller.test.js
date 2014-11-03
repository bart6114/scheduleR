'use strict';

(function() {
	// Tasks Controller Spec
	describe('Tasks Controller Tests', function() {
		// Initialize global variables
		var TasksController,
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

			// Initialize the Tasks controller.
			TasksController = $controller('TasksController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Task object fetched from XHR', inject(function(Tasks) {
			// Create sample Task using the Tasks service
			var sampleTask = new Tasks({
				name: 'New Task'
			});

			// Create a sample Tasks array that includes the new Task
			var sampleTasks = [sampleTask];

			// Set GET response
			$httpBackend.expectGET('tasks').respond(sampleTasks);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.tasks).toEqualData(sampleTasks);
		}));

		it('$scope.findOne() should create an array with one Task object fetched from XHR using a taskId URL parameter', inject(function(Tasks) {
			// Define a sample Task object
			var sampleTask = new Tasks({
				name: 'New Task'
			});

			// Set the URL parameter
			$stateParams.taskId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/tasks\/([0-9a-fA-F]{24})$/).respond(sampleTask);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.task).toEqualData(sampleTask);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Tasks) {
			// Create a sample Task object
			var sampleTaskPostData = new Tasks({
				name: 'New Task'
			});

			// Create a sample Task response
			var sampleTaskResponse = new Tasks({
				_id: '525cf20451979dea2c000001',
				name: 'New Task'
			});

			// Fixture mock form input values
			scope.name = 'New Task';

			// Set POST response
			$httpBackend.expectPOST('tasks', sampleTaskPostData).respond(sampleTaskResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Task was created
			expect($location.path()).toBe('/tasks/' + sampleTaskResponse._id);
		}));

		it('$scope.update() should update a valid Task', inject(function(Tasks) {
			// Define a sample Task put data
			var sampleTaskPutData = new Tasks({
				_id: '525cf20451979dea2c000001',
				name: 'New Task'
			});

			// Mock Task in scope
			scope.task = sampleTaskPutData;

			// Set PUT response
			$httpBackend.expectPUT(/tasks\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/tasks/' + sampleTaskPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid taskId and remove the Task from the scope', inject(function(Tasks) {
			// Create new Task object
			var sampleTask = new Tasks({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Tasks array and include the Task
			scope.tasks = [sampleTask];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/tasks\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleTask);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.tasks.length).toBe(0);
		}));
	});
}());