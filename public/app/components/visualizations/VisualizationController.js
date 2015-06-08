angular.module('app')
.controller('VCtrl', ['$scope', 'VService', 'Barchart', 'Linechart', 'Minmax', '$modal',
function($scope, VService, Barchart, Linechart, Minmax, $modal) {
	var maxAreas = 2;
	$scope.noSelected = 0;
	$scope.loading = false;
	$scope.errorMessage;
	$scope.error = false;
	$scope.percentComplete = 0;
	var loadInterval;
	var whyInterval;
	console.log($scope);
	var modalInstance;
	var regions = $scope.regions = [];

	$scope.remove = function(regionName) {
		$scope.regions = $scope.regions.filter(function(region) {
			if(region.name === regionName) {
				region.event.feature.setProperty('isColorful', false);
			}
			return regionName !== region.name;
		});
	}

	$scope.progress = function() {
		$scope.loading = true;
		$scope.percentComplete = 0;
		console.log($scope.regions);
		$scope.regions.forEach(function(region) {
			loadLineGraph(region.zip);
			loadBarChart(region.zip);
		});
		console.log($('.tab-pane'));
		var i = 0;
		$('.tab-pane').addClass(function(index) {
			return 'bar' + $scope.regions[i++].zip;
		});
		loadInterval = setInterval(function() {
			console.log('calling')
			$scope.percentComplete += 5;
			if($scope.percentComplete === 100) {
				setTimeout(function() {
					clearInterval(loadInterval);
					$('html, body').animate({
						scrollTop: $("#visualization").offset().top
					}, 2000);
					$scope.loading = false;
					modalInstance.close('data');
				}, 1000);
			}
		}, 750);
	}
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
    	    			$scope.error = false;

    	    			event.feature.setProperty('isColorful', false);
    	    			$scope.regions = regions.filter(function(region) {
    	    				return region.name !== event.feature.getProperty('NAME');
    	    			});
    	    			$scope.noSelected = regions.length;
    	    		} else {
    	    			if($scope.regions.length === maxAreas) {
    	    				$scope.error = true;
    	    				$scope.errorMessage = 'You have selected too many regions. Deselect one to choose another.'
    	    				return;
    	    			}
    	    			var exists = false;
    	    			event.feature.setProperty('isColorful', true);
    	    			$scope.regions.some(function(region) {
    	    				if(event.feature.getProperty('NAME') === region.name) {
    	    					exists = true;
    	    					return true;
    	    				}
    	    				return false;
    	    			});
    	    			if(!exists) {
    	    				$scope.regions.push({
    	    					zip : zip,
    	    					name : event.feature.getProperty('NAME'),
    	    					event : event
    	    				});

    	    				// loadBarChart(zip);
    	    				// loadLineGraph(zip);
    	    				// loadMinMax(zip);
    	    				// loadForeclosure(zip);
    	    			}
    	    		}
        		} else {
        			$scope.error = true;
        			$scope.errorMessage = 'You are clicking too fast! Try again.'
        			//error
        			//you are clicking too fast error.
        		}
        	});
        });

		map.data.addListener('mouseover', function(event) {
			var point = event.latLng;
			var name = event.feature.getProperty('NAME');
			$scope.regionName = name;
			map.data.overrideStyle(event.feature, { strokeWeight : 3 });

		});
		map.data.addListener('mouseout', function(event) {
			map.data.revertStyle();
		});
	})
	$scope.openModal = function(name) {
		whyInterval = setInterval(function() {
			if(document.getElementById('why') === null) {
				clearInterval(whyInterval);
				return;
			}
			document.getElementById('why').click();
		}, 50);
		modalInstance = $modal.open({
			animation : $scope.animationsEnabled,
			templateUrl : name,
			controller : 'ModalController',
			scope : $scope,
			windowClass : 'app-modal-window'
		});

		modalInstance.result.then(function(reason) {
			clearInterval(whyInterval);
			if(reason === 'data') {
			}
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
			Linechart.loadChart(data, function(error) {
				if(error) {
					clearInterval(whyInterval);
					$scope.error = true;
					$scope.errorMessage = 'Unable to gather data, please try again.';
				}
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
				if(error) {
					clearInterval(whyInterval);
					$scope.error = true;
					$scope.errorMessage = 'Unable to gather data, please try again.';
				}
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