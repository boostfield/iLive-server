'use strict';

//Setting up route
angular.module('quota-recorders').config(['$stateProvider',
    function ($stateProvider) {
        // Scenic spots state routing
        $stateProvider.
            state('listQuotaRecorder', {
                url: '/quota-recorders',
                templateUrl: 'modules/quota-recorder/views/list-quota-recorder.client.view.html'
            }).
            state('checkQuotaRecorder', {
                url:'/unchecked-quota-recorders',
                templateUrl: 'modules/quota-recorder/views/check-quota-recorder.client.view.html'
            }).
            state('viewQuotaRecorder', {
                url: '/quota-recorders/:quotaRecorderId',
                templateUrl: 'modules/quota-recorder/views/view-quota-recorder.client.view.html'
            });
    }
]);
