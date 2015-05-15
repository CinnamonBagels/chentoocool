angular.module('app')
.factory('VService', ['$http', function($http) {
	var vservice = {};
	vservice.getPercLoss = function() {
		return $http.get('/getPercentageLoss');
	}

	vservice.getPercGain = function() {
		return $http.get('/getPercentageGain');
	}

	return vservice;
}]);