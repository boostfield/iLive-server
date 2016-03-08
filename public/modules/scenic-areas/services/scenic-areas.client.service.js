'use strict';

//Scenic areas service used to communicate Scenic areas REST endpoints
angular.module('scenic-areas').factory('ScenicAreas', ['$resource',
	function($resource) {
		return $resource('scenic-areas/:scenicAreaId', { scenicAreaId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);