'use strict';

(function() {
	// Reports Controller Spec
	describe('Reports Controller Tests', function() {
		// Initialize global variables
		var ReportsController,
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

			// Initialize the Reports controller.
			ReportsController = $controller('ReportsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Report object fetched from XHR', inject(function(Reports) {
			// Create sample Report using the Reports service
			var sampleReport = new Reports({
				name: 'New Report',
                cron: '* * * * *'
			});

			// Create a sample Reports array that includes the new Report
			var sampleReports = [sampleReport];

			// Set GET response
			$httpBackend.expectGET('reports').respond(sampleReports);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.reports).toEqualData(sampleReports);
		}));

		it('$scope.findOneWithLogs() should create an array with one Report object fetched from XHR using a reportId URL parameter', inject(function(Reports, LogsArray) {
			// Define a sample Report object
			var sampleReport = new Reports({
				name: 'New Report',
                cron: '* * * * *'
			});

            var sampleLog = new LogsArray([{
                msg: 'test',
                task: sampleReport._id
            }]);

			// Set the URL parameter
			$stateParams.reportId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/reports\/([0-9a-fA-F]{24})$/).respond(sampleReport);
            $httpBackend.expectGET(/logs\/list\?maxNumberOfLogs=5&startAt=0$/).respond([sampleLog]); // should usually contain id but isn't know at testing

			// Run controller functionality
			scope.findOneWithLogs();
			$httpBackend.flush();

			// Test scope value

			expect(scope.report).toEqualData(sampleReport);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Reports) {
			// Create a sample Report object
			var sampleReportPostData = new Reports({
				name: 'New Report',
                cron: '* * * * *',
                mailOnError: [],
                mailOnSuccess: [],
                mailRmdReport: []
			});

			// Create a sample Report response
			var sampleReportResponse = new Reports({
				_id: '525cf20451979dea2c000001',
				name: 'New Report',
                cron: '* * * * *'
			});

			// Fixture mock form input values
            scope.report = {};
			scope.report.name = 'New Report';
            scope.report.cron = '* * * * *';

			// Set POST response
			$httpBackend.expectPOST('reports', sampleReportPostData).respond(sampleReportResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Report was created
			expect($location.path()).toBe('/reports/' + sampleReportResponse._id);
		}));

		it('$scope.update() should update a valid Report', inject(function(Reports) {
			// Define a sample Report put data
			var sampleReportPutData = new Reports({
				_id: '525cf20451979dea2c000001',
				name: 'New Report'
			});

			// Mock Report in scope
			scope.report = sampleReportPutData;

			// Set PUT response
			$httpBackend.expectPUT(/reports\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/reports/' + sampleReportPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid reportId and remove the Report from the scope', inject(function(Reports) {
			// Create new Report object
			var sampleReport = new Reports({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Reports array and include the Report
			scope.reports = [sampleReport];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/reports\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleReport);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.reports.length).toBe(0);
		}));
	});
}());