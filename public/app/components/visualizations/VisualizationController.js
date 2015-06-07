angular.module('app')
.controller('VCtrl', ['$scope', 'VService', 'Barchart', 'Linechart', 'Minmax', '$modal',
function($scope, VService, Barchart, Linechart, Minmax, $modal) {
	$scope.loading = false;
	var regions = $scope.regions = [];
	$scope.$on('mapInitialized', function(event, map) {
		map.data.loadGeoJson('./zillowneighborhoodsca.geojson');
		var geocoder = new google.maps.Geocoder();
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
        	geocoder.geocode({ 
        		location : {
    	    		lat : event.latLng.lat(), 
    	    		lng : event.latLng.lng() 
        		}
        	}, function(data, status) {
        		if(status === 'OK') {
    	    		address = data[0].address_components;
    	    		zip = address[address.length - 2].long_name;
    	    		if(isNaN(zip)) {
    	    			zip = address[address.length - 1].long_name;
    	    		}


    	    		if(event.feature.getProperty('isColorful')) {
    	    			event.feature.setProperty('isColorful', false);
    	    			regions.forEach(function(region) {

    	    			})
    	    		} else {
    	    			var exists = false;
    	    			event.feature.setProperty('isColorful', true);
    	    			regions.some(function(region) {
    	    				if(event.feature.getProperty('NAME') === region.name) {
    	    					exists = true;
    	    					return true;
    	    				}
    	    				return false;
    	    			});
    	    			if(!exists) {
    	    				regions.push({
    	    					zip : zip,
    	    					name : event.feature.getProperty('NAME')
    	    				});

    	    				loadBarChart(zip);
    	    				loadLineGraph(zip);
    	    				loadMinMax(zip);
    	    				loadForeclosure(zip);
    	    			}
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
			map.data.overrideStyle(event.feature, { strokeWeight : 3 });

		});
		map.data.addListener('mouseout', function(event) {
			map.data.revertStyle();
		});
	})
	$scope.openModal = function(name) {
		var modalInstance = $modal.open({
			animation : $scope.animationsEnabled,
			templateUrl : name,
			controller : 'ModalController',
			scope : $scope,
			windowClass : 'app-modal-window'
		});

		modalInstance.result.then(function(areas) {
			console.log(areas);
		});
	}
	function loadBarChart(zip) {
		var start = new Date().getTime();
		VService.getMedianRelation(zip).success(function(data, status) {
			//console.log('bar', data);
			Barchart.loadChart(data, function() {
				var end = new Date().getTime() - start;
				console.log(end);
			});
		});
	}

	function loadLineGraph(zip) {
		var start = new Date().getTime();
		VService.getSoldForGain(zip).success(function(data, status) {
			//console.log('line', data);
			Linechart.loadChart(data, function() {
				var end = new Date().getTime() - start;
				console.log(end);
			});
		});
	}

	function loadMinMax(zip) {
		VService.getHighestAndLowest(zip).success(function(data, status) {
			console.log('minmax', data);
			$scope.lowestList = data.lowestList;
			$scope.highestList = data.highestList;
			$scope.lowestSale = data.lowestSale;
			$scope.highestSale = data.highestSale;
			Minmax.generateData(data, function() {
				
			})
		});
	}

	function loadForeclosure(zip) {
		VService.getForeclosure(zip).success(function(data, status) {
			console.log(data);
			radialProgress(document.getElementById('foreclosure'))
				.label('Homes Foreclosed')
				.diameter(150)
				.value(data.Value)
				.render();

			d3.selectAll('svg.radial-svg')
			.attr('height', '150')
			.attr('width', '150');

			d3.selectAll('svg.radial-svg>g')
			.attr('transform', 'translate(22, 0)');
		});
	}
}]);