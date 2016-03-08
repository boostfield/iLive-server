'use strict';

//Setting up route
angular.module('countries').config(['$stateProvider',
    function ($stateProvider) {
        // Countries state routing
        $stateProvider.
            state('listCountries', {
                url: '/countries',
                templateUrl: 'modules/countries/views/list-countries.client.view.html'
            }).
            state('createCountry', {
                url: '/countries/create',
                templateUrl: 'modules/countries/views/create-country.client.view.html'
            }).
            state('viewCountry', {
                url: '/countries/:countryId',
                templateUrl: 'modules/countries/views/view-country.client.view.html'
            }).
            state('editCountry', {
                url: '/countries/:countryId/edit',
                templateUrl: 'modules/countries/views/edit-country.client.view.html'
            });
    }
]);
