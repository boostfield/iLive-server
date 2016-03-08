'use strict';

//Setting up route
angular.module('banners').config(['$stateProvider',
	function($stateProvider) {
		// Banners state routing
		$stateProvider.
		state('listBanners', {
			url: '/banners',
			templateUrl: 'modules/banners/views/list-banners.client.view.html'
		}).
		state('createBanner', {
			url: '/banners/create',
			templateUrl: 'modules/banners/views/create-banner.client.view.html'
		}).
		state('viewBanner', {
			url: '/banners/:bannerId',
			templateUrl: 'modules/banners/views/view-banner.client.view.html'
		}).
		state('editBanner', {
			url: '/banners/:bannerId/edit',
			templateUrl: 'modules/banners/views/edit-banner.client.view.html'
		});
	}
]);