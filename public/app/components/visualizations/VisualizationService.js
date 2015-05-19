angular.module('app')
.factory('VService', ['$http', function($http) {
	var vservice = {};
	vservice.getSoldForLoss = function() {
		return $http.get('/soldForLoss');
	}

	vservice.getSoldForGain = function() {
		return $http.get('/soldForGain');
	}

	vservice.getMedianList = function() {
		return $http.get('/medianListPrice');
	}

	vservice.getMedianSale = function() {
		return $http.get('/medianSalePrice');
	}

	vservice.getIncreasingValues = function() {
		return $http.get('/increasingValues');
	}

	vservice.getDecreasingValues = function() {
		return $http.get('/decreasingValues');
	}

	vservice.getAllData = function() {
		return $http.get('/data');
	}

	return vservice;
}]);