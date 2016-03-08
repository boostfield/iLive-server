'use strict';

//Setting up route
angular.module('scenic-spots').config(['$stateProvider',
    function ($stateProvider) {
        // Scenic spots state routing
        $stateProvider.
            state('listScenicSpots', {
                url: '/scenic-spots',
                templateUrl: 'modules/scenic-spots/views/list-scenic-spots.client.view.html'
            }).
            state('createScenicSpot', {
                url: '/scenic-spots/create',
                templateUrl: 'modules/scenic-spots/views/create-scenic-spot.client.view.html'
            }).
            state('queryScenicSpot', {
                url: '/scenic-spots/query',
                templateUrl: 'modules/scenic-spots/views/query-scenic-spot.client.view.html'
            }).
            state('checkScenicSpot', {
                url:'/scenic-spots/check',
                templateUrl: 'modules/scenic-spots/views/check-scenic-spot.client.view.html'
            }).
            state('viewScenicSpot', {
                url: '/scenic-spots/:scenicSpotId',
                templateUrl: 'modules/scenic-spots/views/view-scenic-spot.client.view.html'
            });
    }
]);
