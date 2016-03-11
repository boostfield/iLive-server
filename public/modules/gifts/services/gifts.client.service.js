'use strict';

//Banners service used to communicate Banners REST endpoints
angular.module('gifts').factory('Gifts', ['$resource',
	function($resource) {
		return $resource('gifts/:giftId', { giftId: '@id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);