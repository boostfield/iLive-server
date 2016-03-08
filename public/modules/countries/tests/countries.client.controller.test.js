'use strict';

(function () {
    // Countries Controller Spec
    describe('Countries Controller Tests', function () {
        // Initialize global variables
        var CountriesController,
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

            // Initialize the Countries controller.
            CountriesController = $controller('CountriesController', {
                $scope: scope
            });
        }));

        it('$scope.find() should create an array with at least one Country object fetched from XHR', inject(function (Countries) {
            // Create sample Country using the Countries service
            var sampleCountry = new Countries({
                name: 'New Country'
            });

            // Create a sample Countries array that includes the new Country
            var sampleCountries = [sampleCountry];

            // Set GET response
            $httpBackend.expectGET('countries').respond(sampleCountries);

            // Run controller functionality
            scope.find();
            $httpBackend.flush();

            // Test scope value
            expect(scope.countries).toEqualData(sampleCountries);
        }));

        it('$scope.findOne() should create an array with one Country object fetched from XHR using a countryId URL parameter', inject(function (Countries) {
            // Define a sample Country object
            var sampleCountry = new Countries({
                name: 'New Country'
            });

            // Set the URL parameter
            $stateParams.countryId = '525a8422f6d0f87f0e407a33';

            // Set GET response
            $httpBackend.expectGET(/countries\/([0-9a-fA-F]{24})$/).respond(sampleCountry);

            // Run controller functionality
            scope.findOne();
            $httpBackend.flush();

            // Test scope value
            expect(scope.country).toEqualData(sampleCountry);
        }));

        it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function (Countries) {
            // Create a sample Country object
            var sampleCountryPostData = new Countries({
                name: 'New Country'
            });

            // Create a sample Country response
            var sampleCountryResponse = new Countries({
                _id: '525cf20451979dea2c000001',
                name: 'New Country'
            });

            // Fixture mock form input values
            scope.name = 'New Country';

            // Set POST response
            $httpBackend.expectPOST('countries', sampleCountryPostData).respond(sampleCountryResponse);

            // Run controller functionality
            scope.create();
            $httpBackend.flush();

            // Test form inputs are reset
            expect(scope.name).toEqual('');

            // Test URL redirection after the Country was created
            expect($location.path()).toBe('/countries/' + sampleCountryResponse._id);
        }));

        it('$scope.update() should update a valid Country', inject(function (Countries) {
            // Define a sample Country put data
            var sampleCountryPutData = new Countries({
                _id: '525cf20451979dea2c000001',
                name: 'New Country'
            });

            // Mock Country in scope
            scope.country = sampleCountryPutData;

            // Set PUT response
            $httpBackend.expectPUT(/countries\/([0-9a-fA-F]{24})$/).respond();

            // Run controller functionality
            scope.update();
            $httpBackend.flush();

            // Test URL location to new object
            expect($location.path()).toBe('/countries/' + sampleCountryPutData._id);
        }));

        it('$scope.remove() should send a DELETE request with a valid countryId and remove the Country from the scope', inject(function (Countries) {
            // Create new Country object
            var sampleCountry = new Countries({
                _id: '525a8422f6d0f87f0e407a33'
            });

            // Create new Countries array and include the Country
            scope.countries = [sampleCountry];

            // Set expected DELETE response
            $httpBackend.expectDELETE(/countries\/([0-9a-fA-F]{24})$/).respond(204);

            // Run controller functionality
            scope.remove(sampleCountry);
            $httpBackend.flush();

            // Test array after successful delete
            expect(scope.countries.length).toBe(0);
        }));
    });
}());
