angular.module('app')
.factory('VService', ['$http', function($http) {
	var vservice = {};
	vservice.getSoldForLoss = function() {
		return $http.get('/soldForLoss');
	}

	vservice.getSoldForGain = function() {
		return $http.get('/soldForGain');
	}

	vservice.getMedianList = function(zip) {
		return $http.get('/medianListPrice', {
			zip : zip
		});
	}

	vservice.getMedianSale = function(zip) {
		return $http.get('/medianSalePrice', {
			zip : zip
		});
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

	vservice.getMedianRelation = function(zip) {
		return $http.get('/medianRelation', {
			zip : zip
		});
	}

	vservice.getHighestAndLowest = function() {
		return $http.get('/highestandlowest');
	}

	return vservice;
}]);