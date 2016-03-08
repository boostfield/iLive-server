'use strict';

//Provinces service used to communicate Provinces REST endpoints
angular.module('provinces').factory('Provinces', ['$resource',
    function ($resource) {
        return $resource('provinces/:provinceId', {
            provinceId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
