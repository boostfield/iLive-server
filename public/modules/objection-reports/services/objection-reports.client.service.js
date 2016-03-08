'use strict';

//Objection reports service used to communicate Objection reports REST endpoints
angular.module('objection-reports').factory('ObjectionReports', ['$resource',
	function($resource) {
		return $resource('objection-reports/:objectionReportId', { objectionReportId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);