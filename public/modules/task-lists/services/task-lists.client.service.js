'use strict';

//Task lists service used to communicate Task lists REST endpoints
angular.module('task-lists').factory('TaskLists', ['$resource',
	function($resource) {
		return $resource('task-lists/:taskListId', { taskListId: '@id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
