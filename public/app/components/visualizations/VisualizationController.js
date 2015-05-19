angular.module('app')
.controller('VCtrl', ['$scope', 'VService', function($scope, VService) {
	VService.getMedianList().success(function(data, status) {
		console.log(data);
	})
}]);