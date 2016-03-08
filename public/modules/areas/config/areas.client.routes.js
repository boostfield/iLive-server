'use strict';

//Setting up route
angular.module('areas').config(['$stateProvider',
    function ($stateProvider) {
        // Cities state routing
        $stateProvider.
            state('createAreas', {
                url: '/areas/create',
                templateUrl: 'modules/areas/views/create-areas.client.view.html'
            });
    }
]);
