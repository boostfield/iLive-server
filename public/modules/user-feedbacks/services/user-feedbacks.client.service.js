'use strict';

//User feedbacks service used to communicate User feedbacks REST endpoints
angular.module('user-feedbacks').factory('UserFeedbacks', ['$resource',
	function($resource) {
		return $resource('user-feedbacks/:userFeedbackId', { userFeedbackId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);