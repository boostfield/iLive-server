'use strict';

//Banners service used to communicate Banners REST endpoints
angular.module('banners').factory('Banners', ['$resource',
	function($resource) {
		return $resource('banners/:bannerId', { bannerId: '@id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);