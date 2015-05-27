angular.module('app')
.controller('VCtrl', ['$scope', 'VService', function($scope, VService) {

	function initialize() {
	    var mapOptions = {
	      zoom: 10,
	      center: {lat: 32.715738, lng: -117.161084},
	      disableDoubleClickZoom : true,
	      streetViewControl : false
	    };
	    var geocoder = new google.maps.Geocoder();
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
	    	var address;
	    	var zip;
	    	console.log(event.latLng)
	    	geocoder.geocode({ 
	    		location : {
		    		lat : event.latLng.lat(), 
		    		lng : event.latLng.lng() 
	    		}
	    	}, function(data, status) {
	    		console.log(status);
	    		if(status === 'OK') {
		    		address = data[0].address_components;
		    		console.log(address);
		    		zip = address[address.length - 2].long_name;
		    		if(isNaN(zip)) {
		    			zip = address[address.length - 1].long_name;
		    		}

		    		if(event.feature.getProperty('isColorful')) {
		    			event.feature.setProperty('isColorful', false);
		    		} else {
		    			event.feature.setProperty('isColorful', true);
		    		}
	    		} else {
	    			//error
	    			//you are clicking too fast error.
	    		}
	    	});
	    });

	    map.data.addListener('mouseover', function(event) {
	    	map.data.revertStyle();
	    	map.data.overrideStyle(event.feature, { strokeWeight : 3 });
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
}]);