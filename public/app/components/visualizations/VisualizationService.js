angular.module('app')
.factory('VService', ['$http', function($http) {
	var vservice = {};
	vservice.getSoldForLoss = function(zip) {
		return $http.get('/soldForLoss');
	}

	vservice.getSoldForGain = function(zip) {
		return $http.get('/soldForGain/' + zip);
	}

	vservice.getMedianList = function(zip) {
		return $http.get('/medianListPrice/' + zip);
	}

	vservice.getMedianSale = function(zip) {
		return $http.get('/medianSalePrice/' + zip);
	}

	vservice.getIncreasingValues = function(zip) {
		return $http.get('/increasingValues/' + zip);
	}

	vservice.getDecreasingValues = function(zip) {
		return $http.get('/decreasingValues/' + zip);
	}

	vservice.getAllData = function() {
		return $http.get('/data');
	}

	vservice.getMedianRelation = function(zip) {
		return $http.get('/medianRelation/' + zip);
	}

	vservice.getHighestAndLowest = function(zip) {
		return $http.get('/highestandlowest/' + zip);
	}

	return vservice;
}]);