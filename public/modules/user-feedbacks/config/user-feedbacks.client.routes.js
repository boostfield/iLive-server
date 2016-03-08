'use strict';

//Setting up route
angular.module('user-feedbacks').config(['$stateProvider',
	function($stateProvider) {
		// User feedbacks state routing
		$stateProvider.
		state('listUserFeedbacks', {
			url: '/user-feedbacks',
			templateUrl: 'modules/user-feedbacks/views/list-user-feedbacks.client.view.html'
		}).
		state('viewUserFeedback', {
			url: '/user-feedbacks/:userFeedbackId',
			templateUrl: 'modules/user-feedbacks/views/view-user-feedback.client.view.html'
		});
	}
]);
