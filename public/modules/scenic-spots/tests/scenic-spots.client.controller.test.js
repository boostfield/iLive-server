'use strict';

(function () {
    // Scenic spots Controller Spec
    describe('Scenic spots Controller Tests', function () {
        // Initialize global variables
        var ScenicSpotsController,
            scope,
            $httpBackend,
            $stateParams,
            $location;

        // The $resource service augments the response object with methods for updating and deleting the resource.
        // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
        // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
        // When the toEqualData matcher compares two objects, it takes only object properties into
        // account and ignores methods.
        beforeEach(function () {
            jasmine.addMatchers({
                toEqualData: function (util, customEqualityTesters) {
                    return {
                        compare: function (actual, expected) {
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
        beforeEach(inject(function ($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
            // Set a new global scope
            scope = $rootScope.$new();

            // Point global variables to injected services
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            $location = _$location_;

            // Initialize the Scenic spots controller.
            ScenicSpotsController = $controller('ScenicSpotsController', {
                $scope: scope
            });
        }));

        it('$scope.find() should create an array with at least one Scenic spot object fetched from XHR', inject(function (ScenicSpots) {
            // Create sample Scenic spot using the Scenic spots service
            var sampleScenicSpot = new ScenicSpots({
                name: 'New Scenic spot'
            });

            // Create a sample Scenic spots array that includes the new Scenic spot
            var sampleScenicSpots = [sampleScenicSpot];

            // Set GET response
            $httpBackend.expectGET('scenic-spots').respond(sampleScenicSpots);

            // Run controller functionality
            scope.find();
            $httpBackend.flush();

            // Test scope value
            expect(scope.scenicSpots).toEqualData(sampleScenicSpots);
        }));

        it('$scope.findOne() should create an array with one Scenic spot object fetched from XHR using a scenicSpotId URL parameter', inject(function (ScenicSpots) {
            // Define a sample Scenic spot object
            var sampleScenicSpot = new ScenicSpots({
                name: 'New Scenic spot'
            });

            // Set the URL parameter
            $stateParams.scenicSpotId = '525a8422f6d0f87f0e407a33';

            // Set GET response
            $httpBackend.expectGET(/scenic-spots\/([0-9a-fA-F]{24})$/).respond(sampleScenicSpot);

            // Run controller functionality
            scope.findOne();
            $httpBackend.flush();

            // Test scope value
            expect(scope.scenicSpot).toEqualData(sampleScenicSpot);
        }));

        it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function (ScenicSpots) {
            // Create a sample Scenic spot object
            var sampleScenicSpotPostData = new ScenicSpots({
                name: 'New Scenic spot'
            });

            // Create a sample Scenic spot response
            var sampleScenicSpotResponse = new ScenicSpots({
                _id: '525cf20451979dea2c000001',
                name: 'New Scenic spot'
            });

            // Fixture mock form input values
            scope.name = 'New Scenic spot';

            // Set POST response
            $httpBackend.expectPOST('scenic-spots', sampleScenicSpotPostData).respond(sampleScenicSpotResponse);

            // Run controller functionality
            scope.create();
            $httpBackend.flush();

            // Test form inputs are reset
            expect(scope.name).toEqual('');

            // Test URL redirection after the Scenic spot was created
            expect($location.path()).toBe('/scenic-spots/' + sampleScenicSpotResponse._id);
        }));

        it('$scope.update() should update a valid Scenic spot', inject(function (ScenicSpots) {
            // Define a sample Scenic spot put data
            var sampleScenicSpotPutData = new ScenicSpots({
                _id: '525cf20451979dea2c000001',
                name: 'New Scenic spot'
            });

            // Mock Scenic spot in scope
            scope.scenicSpot = sampleScenicSpotPutData;

            // Set PUT response
            $httpBackend.expectPUT(/scenic-spots\/([0-9a-fA-F]{24})$/).respond();

            // Run controller functionality
            scope.update();
            $httpBackend.flush();

            // Test URL location to new object
            expect($location.path()).toBe('/scenic-spots/' + sampleScenicSpotPutData._id);
        }));

        it('$scope.remove() should send a DELETE request with a valid scenicSpotId and remove the Scenic spot from the scope', inject(function (ScenicSpots) {
            // Create new Scenic spot object
            var sampleScenicSpot = new ScenicSpots({
                _id: '525a8422f6d0f87f0e407a33'
            });

            // Create new Scenic spots array and include the Scenic spot
            scope.scenicSpots = [sampleScenicSpot];

            // Set expected DELETE response
            $httpBackend.expectDELETE(/scenic-spots\/([0-9a-fA-F]{24})$/).respond(204);

            // Run controller functionality
            scope.remove(sampleScenicSpot);
            $httpBackend.flush();

            // Test array after successful delete
            expect(scope.scenicSpots.length).toBe(0);
        }));
    });
}());
