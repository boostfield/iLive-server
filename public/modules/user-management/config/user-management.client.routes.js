'use strict';

//Setting up route
angular.module('user-management').config(['$stateProvider',
    function ($stateProvider) {
        // Tags state routing
        $stateProvider.
            state('listUsers', {
                url: '/users',
                templateUrl: 'modules/user-management/views/list-users.client.view.html'
            }).
            state('createUsers', {
                url: '/users/create',
                templateUrl: 'modules/user-management/views/create-user.client.view.html'
            }).
            state('viewUser', {
                url: '/users/:userId',
                templateUrl: 'modules/user-management/views/view-user.client.view.html'
            }).
            state('viewTenant', {
                url: '/tenants',
                templateUrl: 'modules/user-management/views/list-tenant.client.view.html'
            }).
            state('viewUserOperationRecords', {
                url: '/user-operation-records',
                templateUrl: 'modules/user-management/views/user-operation-records.client.view.html'
            });
    }
]);
