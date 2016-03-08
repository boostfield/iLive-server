'use strict';

//Tasks service used to communicate Tasks REST endpoints
angular.module('tasks').factory('Tasks', ['$resource',
	function($resource) {
		return $resource('tasks/:taskId', { taskId: '@id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

angular.module('tasks').factory('TasksVerify', ['$resource',
    function($resource) {
        return $resource('tasks/:taskId/verify-code', {
            taskId: '@id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);

angular.module('tasks').factory('TasksGrant', ['$resource',
    function($resource) {
        return $resource('tasks/:taskId/grant-awards', { taskId: '@id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);

angular.module('tasks').factory('TasksQuota', ['$resource',
    function($resource) {
        return $resource('tasks/:taskId/add-quota', {
            taskId: '@id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
