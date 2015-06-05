angular.module('app')
.factory('Barchart', function() {
	var barchartservice = {};
	var barcharts = d3.select('#barcharts');
	var linegraph = d3.select('#linegraphs');
	var alldata;
	var currentdata;
	var margin = {
		top : 80,
		right : 20,
		bottom : 80,
		left: 100
	}
	var barchartHeight = $('#barchartsdiv').height() - margin.top - margin.bottom;
	var barchartWidth = $('#barchartsdiv').width() - margin.left - margin.right;
	var sliderWidth = barchartWidth;

	//console.log(barchartHeight);

	var x = d3.scale.ordinal()
			.rangeRoundBands([0, barchartWidth], 0.1);

	var y = d3.scale.linear().range([barchartHeight, 0]);

	var xAxis = d3.svg.axis()
				.scale(x)
				.orient('bottom');

	var yAxis = d3.svg.axis()
				.scale(y)
				.orient('left')
				.ticks(5, 'K');

	var svg = d3.select('#barcharts').append('svg')
				.attr('width', barchartWidth + margin.left + margin.right)
				.attr('height', barchartHeight + margin.bottom + margin.top)
				.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0])
		.html(function(d) {
			return '<p>\
				<strong>List Value: </strong> <span style="color:red">$' + d.listvalue + '</span>\
			</p>\
			<p>\
				<strong>Sale Value: </strong><span style="color:green">' + (+d.salevalue === 0 ? 'Unknown' : '$' + d.salevalue) + '</span>\
			</p>'
		});
	barchartservice.loadChart = function(data, callback) {
		if(!data[0]) {
			return callback();
		}
		var yearspan = data[data.length - 1].year - data[0].year;
		console.log(data);
		alldata = data;
		currentdata = alldata.slice(0, 12);
		barcharts.append('div')
		.style('width', sliderWidth + 'px')
		.style('margin-left', margin.left + 'px')
		.style('bottom', (margin.bottom / 2) + 'px')
		.call(d3.slider().axis(d3.svg.axis().ticks(yearspan)).min(alldata[0].year).max(alldata[alldata.length - 1].year).step(1).on('slide', function(event, value) {
			updateBars(value);
		}));
		x.domain(currentdata.map(function(d) {
			return parseDate(d.month);
		}));

		y.domain([0, d3.max(data, function(d){
			return d.listvalue;
		})]);
		svg.call(tip);
		svg.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + barchartHeight + ')')
			.call(xAxis);
				/*.selectAll('text')
				.attr('transform', function(d) {
					return 'rotate(-65)';
				})
				.style('text-anchor', 'end');*/

		svg.append('g')
			.attr('class', 'y axis')
			.call(yAxis)
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', 6)
			.attr('dy', '.71em')
			.style('text-anchor', 'end')
			.text('List Value');

		svg.selectAll('.bar')
			.data(currentdata)
			.enter().append('rect')
			.attr('class', 'bar')
			.attr('x', function(d) {
				return x(parseDate(d.month));
			})
			.attr('width', x.rangeBand())
			.attr('y', function(d) {
				return y(d.listvalue);
			})
			.attr('height', function(d) {
				return barchartHeight - y(d.listvalue);
			})
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide);

		svg.selectAll('rect')
		.style('fill', '#800000');
		callback();
	}

	function updateBars(year) {
		var counter = year - 2009;
		var lowbound = counter * 12;
		var highbound = lowbound + 12 > alldata.length ? alldata.length : lowbound + 12;
		var currentdata = alldata.slice(lowbound, highbound);
		console.log(currentdata);
		if(currentdata.length != 12) {
			for(var i = 1; i < 12; i++) {
				currentdata[i] = {
					listvalue : 0,
					salevalue : 0,
				}
			}
		}

		svg.selectAll('rect')
			.data(currentdata)
			.transition()
			.duration(1000)
			.attr('y', function(d) {
				return y(d.listvalue);
			})
			.attr('height', function(d) {
				return barchartHeight - y(d.listvalue);
			})
			.attr('width', x.rangeBand())
	}

	function parseDate(month) {
		switch(month) {
			case 1:
				return 'Jan';
			case 2:
				return 'Feb';
			case 3:
				return 'Mar';
			case 4:
				return 'Apr';
			case 5:
				return 'May';
			case 6:
				return 'Jun';
			case 7:
				return 'Jul';
			case 8:
				return 'Aug';
			case 9:
				return 'Sep';
			case 10:
				return 'Oct';
			case 11:
				return 'Nov';
			case 12:
				return 'Dec';

		}
	}

	return barchartservice;
});