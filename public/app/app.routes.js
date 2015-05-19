angular.module('app')
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider.when('/', {
		templateUrl : 'app/components/visualizations/visualization.html',
		controller : 'VCtrl'
	}).otherwise({
		redirectTo : '/'
	});

	$locationProvider.html5Mode({
		enabled : true,
		requireBase: false
	});
}]);