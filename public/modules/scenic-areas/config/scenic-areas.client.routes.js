'use strict';

//Setting up route
angular.module('scenic-areas').config(['$stateProvider',
	function($stateProvider) {
		// Scenic areas state routing
		$stateProvider.
		state('listScenicAreas', {
			url: '/scenic-areas',
			templateUrl: 'modules/scenic-areas/views/list-scenic-areas.client.view.html'
		}).
		state('createScenicArea', {
			url: '/scenic-areas/create',
			templateUrl: 'modules/scenic-areas/views/create-scenic-area.client.view.html'
		}).
		state('viewScenicArea', {
			url: '/scenic-areas/:scenicAreaId',
			templateUrl: 'modules/scenic-areas/views/view-scenic-area.client.view.html'
		});
	}
]);
