angular.module('app')
.controller('VCtrl', ['$scope', 'VService', function($scope, VService) {
	var barcharts = d3.select('#barcharts');
	var linegraph = d3.select('#linegraphs');
	
	var margin = {
		top : 20,
		right : 20,
		bottom : 80,
		left: 80
	}
	var barchartHeight = $('#barchartsdiv').height() - margin.top - margin.bottom;
	var barchartWidth = $('#barchartsdiv').width() - margin.left - margin.right;
	console.log(barchartHeight);

	var x = d3.scale.ordinal()
			.rangeRoundBands([0, barchartWidth], 0.2);

	var y = d3.scale.linear().range([barchartHeight, 0]);

	var xAxis = d3.svg.axis()
				.scale(x)
				.orient('bottom');

	var yAxis = d3.svg.axis()
				.scale(y)
				.orient('left')
				.ticks(3, 'K');

	var svg = d3.select('#barcharts').append('svg')
				.attr('width', barchartWidth + margin.left + margin.right)
				.attr('height', barchartHeight + margin.bottom + margin.top)
				.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
	VService.getMedianRelation().success(function(data, status) {
		console.log(data);
		x.domain(data.map(function(d) {
			return d.date;
		}));

		y.domain([0, d3.max(data, function(d){
			return d.listvalue;
		})]);

		svg.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + barchartHeight + ')')
			.call(xAxis)
				.selectAll('text')
				.attr('transform', function(d) {
					return 'rotate(-65)';
				})
				.style('text-anchor', 'end');

		svg.append('g')
			.attr('class', 'y axis')
			.call(yAxis)
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', 6)
			.attr('dy', '.1em')
			.style('text-anchor', 'end')
			.text('List Value');

		svg.selectAll('.bar')
			.data(data)
			.enter().append('rect')
			.attr('class', 'bar')
			.attr('x', function(d) {
				return x(d.date);
			})

			.attr('width', x.rangeBand())
			.attr('y', function(d) {
				return y(d.listvalue);
			})
			.attr('height', function(d) {
				return barchartHeight - y(d.listvalue);
			});


		// console.log(data);
		// data.forEach(function(element) {
		// 	var prices = [element.listvalue, element.salevalue];
		// 	barcharts
		// 	.append('div')
		// 	.attr('class', 'chart')
		// 	.selectAll('div')
		// 	.data(prices)
		// 	.enter()
		// 	.append('div')
		// 		.attr('class', 'bar')
		// 		.style('width', function(d) {
		// 			return d ? d / 1500 + 'px' : '100px'
		// 		})
		// 		.style('height', barHeight)
		// 		.text(function(d) {
		// 			if(!d) {
		// 				return 'No Data.'
		// 			}
		// 			return Math.floor(d);
		// 		});
		// })
	});
}]);