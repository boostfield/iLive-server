'use strict';

(function() {
	// Task lists Controller Spec
	describe('Task lists Controller Tests', function() {
		// Initialize global variables
		var TaskListsController,
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

			// Initialize the Task lists controller.
			TaskListsController = $controller('TaskListsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Task list object fetched from XHR', inject(function(TaskLists) {
			// Create sample Task list using the Task lists service
			var sampleTaskList = new TaskLists({
				name: 'New Task list'
			});

			// Create a sample Task lists array that includes the new Task list
			var sampleTaskLists = [sampleTaskList];

			// Set GET response
			$httpBackend.expectGET('task-lists').respond(sampleTaskLists);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.taskLists).toEqualData(sampleTaskLists);
		}));

		it('$scope.findOne() should create an array with one Task list object fetched from XHR using a taskListId URL parameter', inject(function(TaskLists) {
			// Define a sample Task list object
			var sampleTaskList = new TaskLists({
				name: 'New Task list'
			});

			// Set the URL parameter
			$stateParams.taskListId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/task-lists\/([0-9a-fA-F]{24})$/).respond(sampleTaskList);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.taskList).toEqualData(sampleTaskList);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(TaskLists) {
			// Create a sample Task list object
			var sampleTaskListPostData = new TaskLists({
				name: 'New Task list'
			});

			// Create a sample Task list response
			var sampleTaskListResponse = new TaskLists({
				_id: '525cf20451979dea2c000001',
				name: 'New Task list'
			});

			// Fixture mock form input values
			scope.name = 'New Task list';

			// Set POST response
			$httpBackend.expectPOST('task-lists', sampleTaskListPostData).respond(sampleTaskListResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Task list was created
			expect($location.path()).toBe('/task-lists/' + sampleTaskListResponse._id);
		}));

		it('$scope.update() should update a valid Task list', inject(function(TaskLists) {
			// Define a sample Task list put data
			var sampleTaskListPutData = new TaskLists({
				_id: '525cf20451979dea2c000001',
				name: 'New Task list'
			});

			// Mock Task list in scope
			scope.taskList = sampleTaskListPutData;

			// Set PUT response
			$httpBackend.expectPUT(/task-lists\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/task-lists/' + sampleTaskListPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid taskListId and remove the Task list from the scope', inject(function(TaskLists) {
			// Create new Task list object
			var sampleTaskList = new TaskLists({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Task lists array and include the Task list
			scope.taskLists = [sampleTaskList];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/task-lists\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleTaskList);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.taskLists.length).toBe(0);
		}));
	});
}());