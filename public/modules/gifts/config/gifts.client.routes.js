'use strict';

//Setting up route
angular.module('gifts').config(['$stateProvider',
	function($stateProvider) {
		// Gifts state routing
		$stateProvider.
		state('listGifts', {
			url: '/gifts',
			templateUrl: 'modules/gifts/views/list-gifts.client.view.html'
		}).
		state('createGift', {
			url: '/gifts/create',
			templateUrl: 'modules/gifts/views/create-gift.client.view.html'
		}).
		state('viewGift', {
			url: '/gifts/:giftId',
			templateUrl: 'modules/gifts/views/view-gift.client.view.html'
		}).
		state('editGift', {
			url: '/gifts/:giftId/edit',
			templateUrl: 'modules/gifts/views/edit-gift.client.view.html'
		});
	}
]);