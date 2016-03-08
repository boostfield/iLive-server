'use strict';

//Setting up route
angular.module('task-lists').config(['$stateProvider',
	function($stateProvider) {
		// Task lists state routing
		$stateProvider.
		state('listTaskLists', {
			url: '/task-lists',
			templateUrl: 'modules/task-lists/views/list-task-lists.client.view.html'
		}).
		state('createTaskList', {
			url: '/task-lists/create',
			templateUrl: 'modules/task-lists/views/create-task-list.client.view.html'
		}).
		state('editTaskList', {
			url: '/task-lists/:taskListId/edit',
			templateUrl: 'modules/task-lists/views/edit-task-list.client.view.html'
		});
	}
]);
