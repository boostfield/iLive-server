'use strict';

(function() {
	// Objection reports Controller Spec
	describe('Objection reports Controller Tests', function() {
		// Initialize global variables
		var ObjectionReportsController,
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

			// Initialize the Objection reports controller.
			ObjectionReportsController = $controller('ObjectionReportsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Objection report object fetched from XHR', inject(function(ObjectionReports) {
			// Create sample Objection report using the Objection reports service
			var sampleObjectionReport = new ObjectionReports({
				name: 'New Objection report'
			});

			// Create a sample Objection reports array that includes the new Objection report
			var sampleObjectionReports = [sampleObjectionReport];

			// Set GET response
			$httpBackend.expectGET('objection-reports').respond(sampleObjectionReports);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.objectionReports).toEqualData(sampleObjectionReports);
		}));

		it('$scope.findOne() should create an array with one Objection report object fetched from XHR using a objectionReportId URL parameter', inject(function(ObjectionReports) {
			// Define a sample Objection report object
			var sampleObjectionReport = new ObjectionReports({
				name: 'New Objection report'
			});

			// Set the URL parameter
			$stateParams.objectionReportId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/objection-reports\/([0-9a-fA-F]{24})$/).respond(sampleObjectionReport);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.objectionReport).toEqualData(sampleObjectionReport);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(ObjectionReports) {
			// Create a sample Objection report object
			var sampleObjectionReportPostData = new ObjectionReports({
				name: 'New Objection report'
			});

			// Create a sample Objection report response
			var sampleObjectionReportResponse = new ObjectionReports({
				_id: '525cf20451979dea2c000001',
				name: 'New Objection report'
			});

			// Fixture mock form input values
			scope.name = 'New Objection report';

			// Set POST response
			$httpBackend.expectPOST('objection-reports', sampleObjectionReportPostData).respond(sampleObjectionReportResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Objection report was created
			expect($location.path()).toBe('/objection-reports/' + sampleObjectionReportResponse._id);
		}));

		it('$scope.update() should update a valid Objection report', inject(function(ObjectionReports) {
			// Define a sample Objection report put data
			var sampleObjectionReportPutData = new ObjectionReports({
				_id: '525cf20451979dea2c000001',
				name: 'New Objection report'
			});

			// Mock Objection report in scope
			scope.objectionReport = sampleObjectionReportPutData;

			// Set PUT response
			$httpBackend.expectPUT(/objection-reports\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/objection-reports/' + sampleObjectionReportPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid objectionReportId and remove the Objection report from the scope', inject(function(ObjectionReports) {
			// Create new Objection report object
			var sampleObjectionReport = new ObjectionReports({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Objection reports array and include the Objection report
			scope.objectionReports = [sampleObjectionReport];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/objection-reports\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleObjectionReport);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.objectionReports.length).toBe(0);
		}));
	});
}());