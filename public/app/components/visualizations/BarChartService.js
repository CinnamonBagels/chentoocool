angular.module('app')
.factory('Barchart', function() {
	var barchartservice = {};
	var barcharts = d3.select('#barcharts');
	var linegraph = d3.select('#linegraphs');
	var alldata;
	var parse = d3.time.format("%m/%Y").parse;
	var currentdata;
	var format = d3.format('0,000');
	var margin = {
		top : 30,
		right : 100,
		bottom : 220,
		left: 100
	}

	var color = d3.scale.ordinal().range(['#326097', '#48d2d9']);
	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0])
		.html(function(d) {
			return '<p>\
				<strong>Median List Value: </strong> <span style="color:#326097">$' + d.listvalue + '</span>\
			</p>\
			<p>\
				<strong>Median Sale Value: </strong><span style="color:#48d2d9">' + (+d.salevalue === 0 ? 'Unknown' : '$' + d.salevalue) + '</span>\
			</p>'
		});
	barchartservice.loadChart = function(data, callback) {
		if(!data[0]) {
			return callback('error');
		}
		var barchartHeight = $('#barchartsdiv').height() - margin.top - margin.bottom;
		var barchartWidth = $('#barchartsdiv').width() - margin.left - margin.right;

		var whatever;
		//console.log(barchartHeight);

		var x = d3.scale.ordinal()
				.rangeRoundBands([0, barchartWidth], 0.1);

		var x0 = d3.scale.ordinal();


		var y = d3.scale.linear().range([barchartHeight, 0]);



		var xAxis = d3.svg.axis()
					.scale(x)
					.orient('bottom')
					.tickFormat(d3.time.format("%b-%Y"))
					.ticks(d3.time.years, 1);

		var yAxis = d3.svg.axis()
					.scale(y)
					.orient('left')
					.ticks(5, 'K')
					.tickFormat(d3.format('0,000'));

		var svg = d3.select('.bar' + data[0].regionname).append('svg')
					.attr('width', barchartWidth + margin.left + margin.right)
					.attr('height', barchartHeight + margin.bottom + margin.top)
					.append('g')
					.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
		var values = d3.keys(data[0].values);

		var max = d3.max(data, function(d) {
			return d.listvalue > d.salevalue ? d.listvalue : d.salevalue;
		});

		color.domain(d3.keys(data[0].values));

		data.forEach(function(d) {
			d.colorvalues = values.map(function(name, index, array) {
				return {
					name : name,
					value : d.values[name],
					listvalue : d.listvalue,
					salevalue : d.salevalue
				}		
			});
		});
		var yearspan = data[data.length - 1].year - data[0].year;
		//console.log(data);
		alldata = data;
		//currentdata = alldata.slice(0, 12);

		// barcharts.append('div')
		// .style('width', sliderWidth + 'px')
		// .style('margin-left', margin.left + 'px')
		// .style('bottom', (margin.bottom / 2) + 'px')
		// // .call(d3.slider().axis(d3.svg.axis().ticks(yearspan).tickFormat(d3.format('d'))).min(alldata[0].year).max(alldata[alldata.length - 1].year).step(1).on('slide', function(event, value) {
		// // 	updateBars(value);
		// // }));

		x.domain(data.map(function(d) {
			return parse(d.date);
		}));

		x0.domain(values).rangeRoundBands([0, x.rangeBand()]);

		y.domain([0, max]);

		svg.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + barchartHeight + ')')
			.call(xAxis)
			.selectAll("text")  
				.style('font-size', '0.7em')
	            .style("text-anchor", "end")
	            .attr("dx", "-.8em")
	            .attr("dy", ".15em")
	            .attr("transform", function(d) {
	                return "rotate(-65)" 
	                });;

		svg.append('g')
			.attr('class', 'y axis')
			.call(yAxis)
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', 6)
			.attr('dy', '.71em')
			.style('text-anchor', 'end')
			.text(' Value ($)');

		whatever = svg.selectAll('.graph' + data[0].regionname)
			.data(data)
			.enter().append('g')
			.attr('class', 'g')
			.attr('transform', function(d) {
				return 'translate(' + x(parse(d.date)) + ',' + '0)';
			})
			.attr('class', 'lolbar')
			
		whatever.call(tip);

		whatever.selectAll('rect.a' + data[0].regionname)
			.data(function(d) {
				return d.colorvalues;
			})
			.enter().append('rect')
			.attr('width', x0.rangeBand())
			.attr('x', function(d) {
				return x0(d.name);
			})
			.attr('y', function(d) {
				return y(d.value);
			})
			.attr('height', function(d) {
				return barchartHeight - y(d.value);
			})
			.style('fill', function(d) {
				return color(d.name);
			})
			.attr('class', 'a' + data[0].regionname)
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide);

		callback();
	}

	function updateBars(year) {
		var counter = year - 2009;
		var lowbound = counter * 12;
		var highbound = lowbound + 12 > alldata.length ? alldata.length : lowbound + 12;
		var currentdata = alldata.slice(lowbound, highbound);

		
		var mod = [];
		currentdata.forEach(function(d) {
			mod.push(d.colorvalues[0].value);
			mod.push(d.colorvalues[1].value);
		});
		if(mod.length < 24) {
			for(var i = 4; i < 24; i++) {
				mod.push(0);
			}
		}

		svg.selectAll('lolbar').remove();

		whatever = svg.selectAll('.graph')
			.data(currentdata)
			.enter().append('g')
			.attr('class', 'g')
			.attr('transform', function(d) {
				return 'translate(' + x(parseDate(d.month)) + ',' + '0)';
			})
			.attr('class', 'lolbar')
			
		whatever.call(tip);

		whatever.selectAll('rect')
			.data(function(d) {
				return d.colorvalues;
			})
			.enter().append('rect')
			.attr('width', x0.rangeBand())
			.attr('x', function(d) {
				return x0(d.name);
			})
			.attr('y', function(d) {
				return y(d.value);
			})
			.attr('height', function(d) {
				return barchartHeight - y(d.value);
			})
			.style('fill', function(d) {
				return color(d.name);
			})
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide);
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