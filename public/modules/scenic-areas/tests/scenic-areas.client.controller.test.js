'use strict';

(function() {
	// Scenic areas Controller Spec
	describe('Scenic areas Controller Tests', function() {
		// Initialize global variables
		var ScenicAreasController,
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

			// Initialize the Scenic areas controller.
			ScenicAreasController = $controller('ScenicAreasController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Scenic area object fetched from XHR', inject(function(ScenicAreas) {
			// Create sample Scenic area using the Scenic areas service
			var sampleScenicArea = new ScenicAreas({
				name: 'New Scenic area'
			});

			// Create a sample Scenic areas array that includes the new Scenic area
			var sampleScenicAreas = [sampleScenicArea];

			// Set GET response
			$httpBackend.expectGET('scenic-areas').respond(sampleScenicAreas);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.scenicAreas).toEqualData(sampleScenicAreas);
		}));

		it('$scope.findOne() should create an array with one Scenic area object fetched from XHR using a scenicAreaId URL parameter', inject(function(ScenicAreas) {
			// Define a sample Scenic area object
			var sampleScenicArea = new ScenicAreas({
				name: 'New Scenic area'
			});

			// Set the URL parameter
			$stateParams.scenicAreaId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/scenic-areas\/([0-9a-fA-F]{24})$/).respond(sampleScenicArea);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.scenicArea).toEqualData(sampleScenicArea);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(ScenicAreas) {
			// Create a sample Scenic area object
			var sampleScenicAreaPostData = new ScenicAreas({
				name: 'New Scenic area'
			});

			// Create a sample Scenic area response
			var sampleScenicAreaResponse = new ScenicAreas({
				_id: '525cf20451979dea2c000001',
				name: 'New Scenic area'
			});

			// Fixture mock form input values
			scope.name = 'New Scenic area';

			// Set POST response
			$httpBackend.expectPOST('scenic-areas', sampleScenicAreaPostData).respond(sampleScenicAreaResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Scenic area was created
			expect($location.path()).toBe('/scenic-areas/' + sampleScenicAreaResponse._id);
		}));

		it('$scope.update() should update a valid Scenic area', inject(function(ScenicAreas) {
			// Define a sample Scenic area put data
			var sampleScenicAreaPutData = new ScenicAreas({
				_id: '525cf20451979dea2c000001',
				name: 'New Scenic area'
			});

			// Mock Scenic area in scope
			scope.scenicArea = sampleScenicAreaPutData;

			// Set PUT response
			$httpBackend.expectPUT(/scenic-areas\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/scenic-areas/' + sampleScenicAreaPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid scenicAreaId and remove the Scenic area from the scope', inject(function(ScenicAreas) {
			// Create new Scenic area object
			var sampleScenicArea = new ScenicAreas({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Scenic areas array and include the Scenic area
			scope.scenicAreas = [sampleScenicArea];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/scenic-areas\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleScenicArea);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.scenicAreas.length).toBe(0);
		}));
	});
}());