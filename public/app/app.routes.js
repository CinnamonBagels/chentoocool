angular.module('app')
.config(['$http', '$routeProvider', function($http, $routeProvider) {
	$routeProvider.when('/', {
		templateURL : '/components/visualizations/visualizations.html',
		controller : 'VCtrl'
	}).otherwise({
		redirectTo : '/'
	});
}]);