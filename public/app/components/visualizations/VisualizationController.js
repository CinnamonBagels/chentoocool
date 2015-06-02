angular.module('app')
.controller('VCtrl', ['$scope', 'VService', 'Barchart', 'Linechart', 'Minmax',
function($scope, VService, Barchart, Linechart, Minmax) {
	function initialize() {
	    var mapOptions = {
	      zoom: 10,
	      center: {lat: 32.715738, lng: -117.161084},
	      disableDoubleClickZoom : true,
	      streetViewControl : false
	    };
	    var infowindow;
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
		    			loadBarChart(zip);
		    			loadLineGraph(zip);
		    			loadMinMax(zip);
		    		}
	    		} else {
	    			//error
	    			//you are clicking too fast error.
	    		}
	    	});
	    });

	    map.data.addListener('mouseover', function(event) {
	    	var point = event.latLng;
	    	var name = event.feature.getProperty('NAME');
	    	var marker = new google.maps.Marker({
	    		position : point,
	    		title : name
	    	});
	    	infowindow = new google.maps.InfoWindow({
	    		content : name
	    	});

	    	infowindow.open(map, marker);
	    	console.log(event.feature.getProperty('NAME'));
	    	map.data.revertStyle();
	    	map.data.overrideStyle(event.feature, { strokeWeight : 3 });

	    });
	    map.data.addListener('mouseout', function(event) {
	    	infowindow.close();
	    	map.data.revertStyle();
	    });
	  }

	  google.maps.event.addDomListener(window, 'load', initialize);

	function loadBarChart(zip) {
		VService.getMedianRelation(zip).success(function(data, status) {
			console.log('bar', data);
			Barchart.loadChart(data);
		});
	}

	function loadLineGraph(zip) {
		VService.getSoldForGain(zip).success(function(data, status) {
			console.log('line', data);
			Linechart.loadChart(data);
		});
	}

	function loadMinMax(zip) {
		VService.getHighestAndLowest(zip).success(function(data, status) {
			console.log('minmax', data);
			$scope.lowestList = data.lowestList;
			$scope.highestList = data.highestList;
			$scope.lowestSale = data.lowestSale;
			$scope.highestSale = data.highestSale;
		});
	}
}]);