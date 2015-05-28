angular.module('app')
.factory('VService', ['$http', function($http) {
	var vservice = {};
	vservice.getSoldForLoss = function(zip) {
		return $http.get('/soldForLoss', {
			zip : zip
		});
	}

	vservice.getSoldForGain = function(zip) {
		return $http.get('/soldForGain', {
			zip : zip
		});
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

	vservice.getIncreasingValues = function(zip) {
		return $http.get('/increasingValues', {
			zip : zip
		});
	}

	vservice.getDecreasingValues = function(zip) {
		return $http.get('/decreasingValues', {
			zip : zip
		});
	}

	vservice.getAllData = function() {
		return $http.get('/data');
	}

	vservice.getMedianRelation = function(zip) {
		return $http.get('/medianRelation', {
			zip : zip
		});
	}

	vservice.getHighestAndLowest = function(zip) {
		return $http.get('/highestandlowest', {
			zip : zip
		});
	}

	return vservice;
}]);