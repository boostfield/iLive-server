'use strict';

(function () {
    // Provinces Controller Spec
    describe('Provinces Controller Tests', function () {
        // Initialize global variables
        var ProvincesController,
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

            // Initialize the Provinces controller.
            ProvincesController = $controller('ProvincesController', {
                $scope: scope
            });
        }));

        it('$scope.find() should create an array with at least one Province object fetched from XHR', inject(function (Provinces) {
            // Create sample Province using the Provinces service
            var sampleProvince = new Provinces({
                name: 'New Province'
            });

            // Create a sample Provinces array that includes the new Province
            var sampleProvinces = [sampleProvince];

            // Set GET response
            $httpBackend.expectGET('provinces').respond(sampleProvinces);

            // Run controller functionality
            scope.find();
            $httpBackend.flush();

            // Test scope value
            expect(scope.provinces).toEqualData(sampleProvinces);
        }));

        it('$scope.findOne() should create an array with one Province object fetched from XHR using a provinceId URL parameter', inject(function (Provinces) {
            // Define a sample Province object
            var sampleProvince = new Provinces({
                name: 'New Province'
            });

            // Set the URL parameter
            $stateParams.provinceId = '525a8422f6d0f87f0e407a33';

            // Set GET response
            $httpBackend.expectGET(/provinces\/([0-9a-fA-F]{24})$/).respond(sampleProvince);

            // Run controller functionality
            scope.findOne();
            $httpBackend.flush();

            // Test scope value
            expect(scope.province).toEqualData(sampleProvince);
        }));

        it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function (Provinces) {
            // Create a sample Province object
            var sampleProvincePostData = new Provinces({
                name: 'New Province'
            });

            // Create a sample Province response
            var sampleProvinceResponse = new Provinces({
                _id: '525cf20451979dea2c000001',
                name: 'New Province'
            });

            // Fixture mock form input values
            scope.name = 'New Province';

            // Set POST response
            $httpBackend.expectPOST('provinces', sampleProvincePostData).respond(sampleProvinceResponse);

            // Run controller functionality
            scope.create();
            $httpBackend.flush();

            // Test form inputs are reset
            expect(scope.name).toEqual('');

            // Test URL redirection after the Province was created
            expect($location.path()).toBe('/provinces/' + sampleProvinceResponse._id);
        }));

        it('$scope.update() should update a valid Province', inject(function (Provinces) {
            // Define a sample Province put data
            var sampleProvincePutData = new Provinces({
                _id: '525cf20451979dea2c000001',
                name: 'New Province'
            });

            // Mock Province in scope
            scope.province = sampleProvincePutData;

            // Set PUT response
            $httpBackend.expectPUT(/provinces\/([0-9a-fA-F]{24})$/).respond();

            // Run controller functionality
            scope.update();
            $httpBackend.flush();

            // Test URL location to new object
            expect($location.path()).toBe('/provinces/' + sampleProvincePutData._id);
        }));

        it('$scope.remove() should send a DELETE request with a valid provinceId and remove the Province from the scope', inject(function (Provinces) {
            // Create new Province object
            var sampleProvince = new Provinces({
                _id: '525a8422f6d0f87f0e407a33'
            });

            // Create new Provinces array and include the Province
            scope.provinces = [sampleProvince];

            // Set expected DELETE response
            $httpBackend.expectDELETE(/provinces\/([0-9a-fA-F]{24})$/).respond(204);

            // Run controller functionality
            scope.remove(sampleProvince);
            $httpBackend.flush();

            // Test array after successful delete
            expect(scope.provinces.length).toBe(0);
        }));
    });
}());
