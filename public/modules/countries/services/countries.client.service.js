'use strict';

//Countries service used to communicate Countries REST endpoints
angular.module('countries').factory('Countries', ['$resource',
    function ($resource) {
        return $resource('countries/:countryId', {
            countryId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
