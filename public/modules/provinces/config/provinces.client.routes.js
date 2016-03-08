'use strict';

//Setting up route
angular.module('provinces').config(['$stateProvider',
    function ($stateProvider) {
        // Provinces state routing
        $stateProvider.
            state('listProvinces', {
                url: '/provinces',
                templateUrl: 'modules/provinces/views/list-provinces.client.view.html'
            }).
            state('createProvince', {
                url: '/provinces/create',
                templateUrl: 'modules/provinces/views/create-province.client.view.html'
            }).
            state('viewProvince', {
                url: '/provinces/:provinceId',
                templateUrl: 'modules/provinces/views/view-province.client.view.html'
            }).
            state('editProvince', {
                url: '/provinces/:provinceId/edit',
                templateUrl: 'modules/provinces/views/edit-province.client.view.html'
            });
    }
]);
