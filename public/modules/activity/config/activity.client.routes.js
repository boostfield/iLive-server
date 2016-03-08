'use strict';

//Setting up route
angular.module('activity').config(['$stateProvider',
    function($stateProvider) {
        // Banners state routing
        $stateProvider
            .state('listActivity',{
                url:'/my-activity-list',
                templateUrl:'modules/activity/views/my-activity-list.client.view.html'
            })
            .state('activity', {
                url: '/my-activity/:activityId',
                templateUrl: 'modules/activity/views/my-activity.client.view.html'
            });
    }
]);
