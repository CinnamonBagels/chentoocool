angular.module('app')
.factory('Linechart', function() {
	var linechartservice = {};
	var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = $('#linegraphs').width() - margin.left - margin.right,
    height = $('#linegraphdiv').height() - margin.top - margin.bottom;

    console.log(width, height);

    var x = d3.time.scale().range([0, width]);

    var y = d3.scale.linear().range([height, 0]);
    var parseDate = d3.time.format('%m-%Y').parse;
    var xAxis = d3.svg.axis()
    	.scale(x)
    	.orient('bottom');

    var yAxis = d3.svg.axis()
    	.scale(y)
    	.orient('left');

    var line = d3.svg.line()
    	.x(function(d) {
    		return x(d.date);
    	})
    	.y(function(d) {
    		return y(d.Value);
    	});

    var svg = d3.select('#linegraphs').append('svg')
    	.attr('width', width + margin.left + margin.right)
    	.attr('height', height + margin.top + margin.bottom)
    	.append('g')
    	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


	linechartservice.loadChart = function(data) {
		data.forEach(function(d) {
			d.date = parseDate(d.Month + '-' + d.Year);
			d.Value = +d.Value;
			console.log(d.Month, d.Year, d.Value);
		});

		x.domain(d3.extent(data, function(d) {
			return d.date;
		}));

		y.domain(d3.extent(data, function(d) {
			return d.Value;
		}));

		svg.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(0' + ',' + height + ')')
		.call(xAxis);

		svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	    .append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text("% Sold for gain");

	      svg.append('path')
	      .datum(data)
	      .attr('class', 'line')
	      .attr('d', line);
	}
	return linechartservice;
})