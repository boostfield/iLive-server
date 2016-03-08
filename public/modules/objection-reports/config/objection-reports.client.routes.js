'use strict';

//Setting up route
angular.module('objection-reports').config(['$stateProvider',
	function($stateProvider) {
		// Objection reports state routing
		$stateProvider.
		state('listObjectionReports', {
			url: '/objection-reports',
			templateUrl: 'modules/objection-reports/views/list-objection-reports.client.view.html'
		}).
		state('createObjectionReport', {
			url: '/objection-reports/create',
			templateUrl: 'modules/objection-reports/views/create-objection-report.client.view.html'
		}).
		state('viewObjectionReport', {
			url: '/objection-reports/:objectionReportId',
			templateUrl: 'modules/objection-reports/views/view-objection-report.client.view.html'
		}).
		state('editObjectionReport', {
			url: '/objection-reports/:objectionReportId/edit',
			templateUrl: 'modules/objection-reports/views/edit-objection-report.client.view.html'
		});
	}
]);