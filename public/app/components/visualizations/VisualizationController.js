angular.module('app')
.controller('VCtrl', ['$scope', 'VService', function($scope, VService) {

	function initialize() {
	    var mapOptions = {
	      zoom: 10,
	      center: {lat: 32.715738, lng: -117.161084}
	    };
	    var map = new google.maps.Map(document.getElementById('map'),
	        mapOptions);

	    map.data.loadGeoJson('./zillowneighborhoodsca.geojson');

	    map.data.setStyle(function(feature) {
	    	var color;

	    	if(!feature.getProperty('isColorful')) {
	    		color = 'grey';
	    	} else {
	    		color = 'green';
	    	}

	    	return {
	    		fillColor : color,
	    		strokeColor : color,
	    		strokeWeight : 1
	    	};
	    });
	    map.data.addListener('click', function(event) {
	    	if(event.feature.getProperty('isColorful')) {
	    		event.feature.setProperty('isColorful', false);
	    	} else {
	    		event.feature.setProperty('isColorful', true);
	    	}
	    });

	    map.data.addListener('mouseover', function(event) {
	    	map.data.revertStyle();
	    	map.data.overrideStyle(event.feature, { strokeWeight : 4 });
	    });

	    map.data.addListener('mouseout', function(event) {
	    	map.data.revertStyle();
	    });
	  }

	  google.maps.event.addDomListener(window, 'load', initialize);

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
	});

    function InitDummyData() {
    	var data = [{"sale": "-40", "year": "2000"}, {"sale": "20","year": "2002"}, 
    				{"sale": "-10", "year": "2004"}, {"sale": "5","year": "2006"}, 
    				{"sale": "-5", "year": "2008"}, {"sale": "33","year": "2010"}];
    }

    var svg = d3.select("body").append("svg")
    var lineWIDTH = 1000;
    var lineHEIGHT = 500;
    var lineMARGINS = {top: 20, right: 20, bottom: 20, left: 50};
    var linexScale = d3.scale.linear().range([lineMARGINS.left, lineWIDTH - lineMARGINS.right]).domain([2000,2010]);
    var lineyScale = d3.scale.linear().range([lineHEIGHT - lineMARGINS.top, lineMARGINS.bottom]).domain([-50, 50]);
    var linexAxis = d3.svg.axis().scale(linexScale);
    var lineyAxis = d3.svg.axis().scale(lineyScale).orient("left");
                    
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (lineHEIGHT - lineMARGINS.bottom) + ")")
        .call(linexAxis);
                    
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (lineMARGINS.left) + ",0)")
        .call(lineyAxis);

    var lineGen = d3.svg.line()
        .x(function(d) {
            return linexScale(d.year);
        })
        .y(function(d) {
            return lineyScale(d.sale);
        })
        .interpolate("basis");
                    
    svg.append('path')
        .attr('d', lineGen(data))
        .attr('stroke', 'green')
        .attr('stroke-width', 2)
        .attr('fill', 'none');

    InitDummyData();
}]);