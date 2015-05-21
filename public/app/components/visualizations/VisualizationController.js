angular.module('app')
.controller('VCtrl', ['$scope', 'VService', function($scope, VService) {
	var barcharts = d3.select('#barcharts');
	var linegraph = d3.select('#linegraphs');
	var barHeight = '20px';
	var width=300;
	var scaleX = d3.scale.linear().range([0, 300]);
	VService.getMedianRelation().success(function(data, status) {
		console.log(data);
		data.forEach(function(element) {
			var prices = [element.listvalue, element.salevalue];
			barcharts
			.append('div')
			.attr('class', 'chart')
			.selectAll('div')
			.data(prices)
			.enter()
			.append('div')
				.attr('class', 'bar')
				.style('width', function(d) {
					return d ? d / 1500 + 'px' : '100px'
				})
				.style('height', barHeight)
				.text(function(d) {
					if(!d) {
						return 'No Data.'
					}
					return Math.floor(d);
				});
		})
	});
}]);