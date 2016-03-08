'use strict';

//Scenic spots service used to communicate Scenic spots REST endpoints
angular.module('scenic-spots').factory('ScenicSpots', ['$resource',
    function ($resource) {
        return $resource('scenic-spots/:scenicSpotId', {
            scenicSpotId: '@id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);

angular.module('scenic-spots').factory('Pictures', ['$resource',
    function ($resource) {
        return $resource('pictures/:pictureId/on-main-page', {
            pictureId: '@id'
        }, {
            update: {
                method: 'PUT'
            },
            setOnMainPage: {

            }
        });
    }
]);
