'use strict';

(function() {
	// Banners Controller Spec
	describe('Banners Controller Tests', function() {
		// Initialize global variables
		var BannersController,
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

			// Initialize the Banners controller.
			BannersController = $controller('BannersController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Banner object fetched from XHR', inject(function(Banners) {
			// Create sample Banner using the Banners service
			var sampleBanner = new Banners({
				name: 'New Banner'
			});

			// Create a sample Banners array that includes the new Banner
			var sampleBanners = [sampleBanner];

			// Set GET response
			$httpBackend.expectGET('banners').respond(sampleBanners);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.banners).toEqualData(sampleBanners);
		}));

		it('$scope.findOne() should create an array with one Banner object fetched from XHR using a bannerId URL parameter', inject(function(Banners) {
			// Define a sample Banner object
			var sampleBanner = new Banners({
				name: 'New Banner'
			});

			// Set the URL parameter
			$stateParams.bannerId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/banners\/([0-9a-fA-F]{24})$/).respond(sampleBanner);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.banner).toEqualData(sampleBanner);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Banners) {
			// Create a sample Banner object
			var sampleBannerPostData = new Banners({
				name: 'New Banner'
			});

			// Create a sample Banner response
			var sampleBannerResponse = new Banners({
				_id: '525cf20451979dea2c000001',
				name: 'New Banner'
			});

			// Fixture mock form input values
			scope.name = 'New Banner';

			// Set POST response
			$httpBackend.expectPOST('banners', sampleBannerPostData).respond(sampleBannerResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Banner was created
			expect($location.path()).toBe('/banners/' + sampleBannerResponse._id);
		}));

		it('$scope.update() should update a valid Banner', inject(function(Banners) {
			// Define a sample Banner put data
			var sampleBannerPutData = new Banners({
				_id: '525cf20451979dea2c000001',
				name: 'New Banner'
			});

			// Mock Banner in scope
			scope.banner = sampleBannerPutData;

			// Set PUT response
			$httpBackend.expectPUT(/banners\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/banners/' + sampleBannerPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid bannerId and remove the Banner from the scope', inject(function(Banners) {
			// Create new Banner object
			var sampleBanner = new Banners({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Banners array and include the Banner
			scope.banners = [sampleBanner];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/banners\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleBanner);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.banners.length).toBe(0);
		}));
	});
}());