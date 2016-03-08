'use strict';

angular.module('quota-recorders').factory('QuotaRecorders', ['$resource',
    function ($resource) {
        return $resource('quota-recorders/:quotaRecorderId', {
            quotaRecorderId: '@id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);

