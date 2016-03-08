'use strict';

// Objection reports controller
angular.module('objection-reports').controller('ObjectionReportsController', ['$scope', '$stateParams', '$location', '$http', 'Authentication', 'ObjectionReports',
	function($scope, $stateParams, $location, $http, Authentication, ObjectionReports) {
		$scope.authentication = Authentication;
        $scope.itemsPerPage = 10;
		// Create new Objection report
		$scope.create = function() {
			// Create new Objection report object
			var objectionReport = new ObjectionReports ({
				name: this.name
			});

			// Redirect after save
			objectionReport.$save(function(response) {
				$location.path('objection-reports/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Objection report
		$scope.remove = function(objectionReport) {
			if ( objectionReport ) { 
				objectionReport.$remove();

				for (var i in $scope.objectionReports) {
					if ($scope.objectionReports [i] === objectionReport) {
						$scope.objectionReports.splice(i, 1);
					}
				}
			} else {
				$scope.objectionReport.$remove(function() {
					$location.path('objection-reports');
				});
			}
		};

		// Update existing Objection report
		$scope.update = function() {
			var objectionReport = $scope.objectionReport;

			objectionReport.$update(function() {
				$location.path('objection-reports/' + objectionReport._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Objection reports
		$scope.find = function() {
            ObjectionReports.get({pageNumber: 0, pageSize: $scope.itemsPerPage}).$promise.then(function (result) {
                $scope.objectionReports = result.objectionReports;
                $scope.totalItems = result.total;
            });
		};

		// Find existing Objection report
		$scope.findOne = function() {
			$scope.objectionReport = ObjectionReports.get({ 
				objectionReportId: $stateParams.objectionReportId
			});
		};
	}
]);
