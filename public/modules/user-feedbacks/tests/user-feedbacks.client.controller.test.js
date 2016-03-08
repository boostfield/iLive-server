'use strict';

(function() {
	// User feedbacks Controller Spec
	describe('User feedbacks Controller Tests', function() {
		// Initialize global variables
		var UserFeedbacksController,
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

			// Initialize the User feedbacks controller.
			UserFeedbacksController = $controller('UserFeedbacksController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one User feedback object fetched from XHR', inject(function(UserFeedbacks) {
			// Create sample User feedback using the User feedbacks service
			var sampleUserFeedback = new UserFeedbacks({
				name: 'New User feedback'
			});

			// Create a sample User feedbacks array that includes the new User feedback
			var sampleUserFeedbacks = [sampleUserFeedback];

			// Set GET response
			$httpBackend.expectGET('user-feedbacks').respond(sampleUserFeedbacks);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.userFeedbacks).toEqualData(sampleUserFeedbacks);
		}));

		it('$scope.findOne() should create an array with one User feedback object fetched from XHR using a userFeedbackId URL parameter', inject(function(UserFeedbacks) {
			// Define a sample User feedback object
			var sampleUserFeedback = new UserFeedbacks({
				name: 'New User feedback'
			});

			// Set the URL parameter
			$stateParams.userFeedbackId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/user-feedbacks\/([0-9a-fA-F]{24})$/).respond(sampleUserFeedback);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.userFeedback).toEqualData(sampleUserFeedback);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(UserFeedbacks) {
			// Create a sample User feedback object
			var sampleUserFeedbackPostData = new UserFeedbacks({
				name: 'New User feedback'
			});

			// Create a sample User feedback response
			var sampleUserFeedbackResponse = new UserFeedbacks({
				_id: '525cf20451979dea2c000001',
				name: 'New User feedback'
			});

			// Fixture mock form input values
			scope.name = 'New User feedback';

			// Set POST response
			$httpBackend.expectPOST('user-feedbacks', sampleUserFeedbackPostData).respond(sampleUserFeedbackResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the User feedback was created
			expect($location.path()).toBe('/user-feedbacks/' + sampleUserFeedbackResponse._id);
		}));

		it('$scope.update() should update a valid User feedback', inject(function(UserFeedbacks) {
			// Define a sample User feedback put data
			var sampleUserFeedbackPutData = new UserFeedbacks({
				_id: '525cf20451979dea2c000001',
				name: 'New User feedback'
			});

			// Mock User feedback in scope
			scope.userFeedback = sampleUserFeedbackPutData;

			// Set PUT response
			$httpBackend.expectPUT(/user-feedbacks\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/user-feedbacks/' + sampleUserFeedbackPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid userFeedbackId and remove the User feedback from the scope', inject(function(UserFeedbacks) {
			// Create new User feedback object
			var sampleUserFeedback = new UserFeedbacks({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new User feedbacks array and include the User feedback
			scope.userFeedbacks = [sampleUserFeedback];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/user-feedbacks\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleUserFeedback);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.userFeedbacks.length).toBe(0);
		}));
	});
}());