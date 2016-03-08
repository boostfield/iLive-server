'use strict';

//Setting up route
angular.module('cities').config(['$stateProvider',
    function ($stateProvider) {
        // Cities state routing
        $stateProvider.
            state('listCities', {
                url: '/cities',
                templateUrl: 'modules/cities/views/list-cities.client.view.html'
            }).
            state('createCity', {
                url: '/cities/create',
                templateUrl: 'modules/cities/views/create-city.client.view.html'
            }).
            state('viewHotCity', {
                url: '/cities/hot',
                templateUrl: 'modules/cities/views/hot-cities.client.view.html'
            }).
            state('viewCity', {
                url: '/cities/:cityId',
                templateUrl: 'modules/cities/views/view-city.client.view.html'
            });
    }
]);
