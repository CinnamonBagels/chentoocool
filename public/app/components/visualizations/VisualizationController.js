angular.module('app')
.controller('VCtrl', ['$scope', 'VService', 'Barchart', 'Linechart', 'Minmax', '$modal',
function($scope, VService, Barchart, Linechart, Minmax, $modal) {
	var maxAreas = 2;
	var expectedAreas;
	$scope.forecloseureComplete = false;
	$scope.thoughtLoading = false;
	$scope.lineLoading = false;
	$scope.notEnoughAreas = false;
	$scope.noSelected = 0;
	$scope.barLoading = false;
	$scope.loading = false;
	$scope.errorMessage;
	$scope.error = false;
	$scope.percentComplete = 0;
	var loadInterval;
	var whyInterval;
	var modalInstance;
	var regions = $scope.regions = [];

	$scope.clearVis = function() {
		d3.selectAll('svg').remove();
		$scope.lowlist = false;
		$scope.highlist = false;
		$scope.highsale = false;
		$scope.lowsale = false;
		$scope.foreclosureComplete = false;
		$scope.notEnoughAreas = false;
		foreclosureArr = [];
		minmaxArr = [];
		$scope.regions = [];
	}

	$scope.remove = function(regionName) {
		$scope.regions = $scope.regions.filter(function(region) {
			if(region.name === regionName) {
				region.event.feature.setProperty('isColorful', false);
			}
			return regionName !== region.name;
		});
	}

	$scope.progress = function() {
		if($scope.regions.length === 0) {
			$scope.error = true;
			$scope.errorMessage = 'You have not selected any regions!';
			return;
		}
		//d3.selectAll('svg').remove()
		expectedAreas = $scope.regions.length;
		if($scope.regions.length === 1) {
			$scope.notEnoughAreas = true;
		}
		$scope.barLoading = true;
		$scope.thoughtLoading = true;
		$scope.lineLoading = true;
		$scope.loading = true;
		$scope.percentComplete = 0;
		$scope.regions.forEach(function(region) {
			loadLineGraph(region.zip, $scope.regions);
			loadBarChart(region.zip);
			loadForeclosure(region.zip);
			loadMinMax(region.zip);
		});
		var i = 0;
		$('.tab-pane').addClass(function(index) {
			return 'bar' + $scope.regions[i++].zip;
		});
		loadInterval = setInterval(function() {
			$scope.percentComplete += 1;
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
		}, 150);
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
        	$scope.error = false;
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
			Barchart.loadChart(data, function(error) {
				if(error) {
					clearInterval(loadInterval);
					$scope.error = true;
					$scope.errorMessage = 'Unable to gather data, please try again.';
					return;
				}
				$scope.barLoading = false;
				var end = new Date().getTime() - start;
				console.log(end);
			});
		});
	}

	function loadLineGraph(zip, zones) {
		var start = new Date().getTime();
		VService.getSoldForGain(zip).success(function(data, status) {
			//console.log('line', data);
			$scope.lineLoading = false;
			Linechart.loadChart(data, zones, function(error) {
				if(error) {
					clearInterval(loadInterval);
					$scope.error = true;
					$scope.errorMessage = 'Unable to gather data, please try again.';
					return;
				}
				var end = new Date().getTime() - start;
				console.log(end);
			});
		});
	}
	var minmaxArr= [];
	$scope.highestlowest = false;
	$scope.firstlowestlist;
	$scope.firsthighestlist;
	$scope.firstlowestsale;
	$scope.firsthighestsale;

	$scope.secondlowestlist;
	$scope.secondhighestlist;
	$scope.secondlowestsale;
	$scope.secondhighestsale;

	$scope.firstlowestlistyear;
	$scope.firsthighestlistyear;
	$scope.firstlowestsaleyear;
	$scope.firsthighestsaleyear;

	$scope.secondlowestlistyear;
	$scope.secondhighestlistyear;
	$scope.secondlowestsaleyear;
	$scope.secondhighestsaleyear;

	$scope.lowestListPercentage;
	$scope.highestListPercentage;
	$scope.lowestSalePercentage;
	$scope.highestSalePercentage;

	$scope.firstlowestlistname;
	$scope.firstlowestsalename;
	$scope.firsthighestlistname;
	$scope.firsthighestsalename;

	$scope.secondlowestlistname;
	$scope.secondlowestsalename;
	$scope.secondhighestlistname;
	$scope.secondhighestsalename;
	// lowestList : lowestList,
	// highestList : highestList,
	// lowestSale : lowestSale,
	// highestSale : highestSale
	$scope.lowsale = false;
	$scope.highsale = false;
	$scope.lowlist = false;
	$scope.highlist = false;
	function numberWithCommas(x) {
	    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	function loadMinMax(zip) {
		VService.getHighestAndLowest(zip).success(function(data, status) {
			$scope.thoughtLoading = false;
			minmaxArr.push(data);
			if(minmaxArr.length === expectedAreas && minmaxArr.length === 2) {
				var first, second;

				$scope.regions.forEach(function(region, index, arr) {
					if(region.zip === minmaxArr[0].zip) {
						first = region.name;
						$scope.firstlowestlist = minmaxArr[0].lowestList;
						$scope.firsthighestlist = minmaxArr[0].highestList;
						$scope.firstlowestsale = minmaxArr[0].lowestSale;
						$scope.firsthighestsale = minmaxArr[0].highestSale;
						$scope.secondlowestlist = minmaxArr[1].lowestList;
						$scope.secondhighestlist = minmaxArr[1].highestList;
						$scope.secondlowestsale = minmaxArr[1].lowestSale;
						$scope.secondhighestsale = minmaxArr[1].highestSale;
						if($scope.firstlowestsale !== 'Unknown' && $scope.secondlowestsale !== 'Unknown') {
							$scope.lowsale = true;
						}

						if($scope.firsthighestsale !== 'Unknown' && $scope.secondhighestsale !== 'Unknown') {
							$scope.highsale = true;
						}
						$scope.lowestListPercentage = Math.abs(Math.floor((($scope.firstlowestlist - $scope.secondlowestlist) / $scope.firstlowestlist) * 100));
						$scope.highestListPercentage = Math.abs(Math.floor((($scope.firsthighestlist - $scope.secondhighestlist) / $scope.firsthighestlist) * 100));
						$scope.lowestSalePercentage = Math.abs(Math.floor((($scope.firstlowestsale - $scope.secondlowestsale) / $scope.firstlowestsale) * 100));
						$scope.highestSalePercentage = Math.abs(Math.floor((($scope.firsthighestsale - $scope.secondhighestsale) / $scope.firsthighestsale) * 100));
					} else {
						second = region.name;
					}
				});

				if($scope.firstlowestlist > $scope.secondlowestlist) {
					$scope.firstlowestlistname = first;
					$scope.secondlowestlistname = second;
					$scope.firstlowestlistyear = minmaxArr[0].lowestlistyear;
					$scope.secondlowestlistyear = minmaxArr[1].lowestlistyear;
				} else {
					$scope.firstlowestlistname = second;
					$scope.secondlowestlistname = first;
					$scope.firstlowestlistyear = minmaxArr[1].lowestlistyear;
					$scope.secondlowestlistyear = minmaxArr[0].lowestlistyear;
				}

				if($scope.firsthighestlist > $scope.secondhighestlist){
					$scope.firsthighestlistname = first;
					$scope.secondhighestlistname = second;
					$scope.firsthighestlistyear = minmaxArr[0].highestlistyear;
					$scope.secondhighestlistyear = minmaxArr[1].highestlistyear;
				}  else {
					$scope.firsthighestlistname = second;
					$scope.secondhighestlistname = first;
					$scope.firsthighestlistyear = minmaxArr[1].highestlistyear;
					$scope.secondhighestlistyear = minmaxArr[0].highestlistyear;
				}

				if($scope.firstlowestsale > $scope.secondlowestsale) {
					$scope.firstlowestsalename = first;
					$scope.secondlowestsalename = second;
					$scope.firstlowestsaleyear = minmaxArr[0].lowestsaleyear;
					$scope.secondlowestsaleyear = minmaxArr[1].lowestsaleyear;
				} else {
					$scope.firstlowestsalename = second;
					$scope.secondlowestsalename = first;
					$scope.firstlowestsaleyear = minmaxArr[1].lowestsaleyear;
					$scope.secondlowestsaleyear = minmaxArr[0].lowestsaleyear;
				}

				if($scope.firsthighestsale > $scope.secondhighestsale) {
					$scope.firsthighestsalename = first;
					$scope.secondhighestsalename = second;
					$scope.firsthighestsaleyear = minmaxArr[0].highestsaleyear;
					$scope.secondhighestsaleyear = minmaxArr[1].highestsaleyear;
				} else {
					$scope.firsthighestsalename = second;
					$scope.secondhighestsalename = first;
					$scope.firsthighestsaleyear = minmaxArr[1].highestsaleyear;
					$scope.secondhighestsaleyear = minmaxArr[0].highestsaleyear;
				}

				$scope.firstlowestlist = numberWithCommas($scope.firstlowestlist)
				$scope.firsthighestlist = numberWithCommas($scope.firsthighestlist)
				$scope.firstlowestsale = numberWithCommas($scope.firstlowestsale)
				$scope.firsthighestsale = numberWithCommas($scope.firsthighestsale)
				$scope.secondlowestlist = numberWithCommas($scope.secondlowestlist)
				$scope.secondhighestlist = numberWithCommas($scope.secondhighestlist)
				$scope.secondlowestsale = numberWithCommas($scope.secondlowestsale)
				$scope.secondhighestsale = numberWithCommas($scope.secondhighestsale)

				$scope.highestlowest = true;
				$scope.highlist = true;
				$scope.lowlist = true;
			}
		});
	}
	var foreclosureArr = [];
	$scope.highestForeclosure;
	$scope.lowestForeclosure;
	$scope.foreclosurePercentage;
	function loadForeclosure(zip) {
		VService.getForeclosure(zip).success(function(data, status) {
			$scope.thoughtLoading = false;
			foreclosureArr.push(data);
			console.log(data);
			if(foreclosureArr.length === expectedAreas && foreclosureArr.length === 2) {
				var len = foreclosureArr[0].length;
				var rone;
				var rtwo;
				var one = 0;
				var two = 0;
				var totalLen = 0;
				for(var i = 0; i < len; i++) {
					if(foreclosureArr[0][i].Value !== null && foreclosureArr[1][i].Value !== null) {
						totalLen++;
						if(foreclosureArr[0][i].Value > foreclosureArr[1][i].Value) {
							one++;
						} else {
							two++;
						}
					}
				}

				if(one > two) {
					$scope.regions.forEach(function(region) {
						if(region.zip === foreclosureArr[0][0].RegionName) {
							$scope.highestForeclosure = region.name;
						} else {
							$scope.lowestForeclosure = region.name;
						}
					});
					$scope.foreclosurePercentage = Math.floor((one / totalLen) * 100);
				} else {
					$scope.regions.forEach(function(region) {
						console.log(region.zip, foreclosureArr[1][0].RegionName, region.name);
						if(region.zip === foreclosureArr[1][0].RegionName) {
							$scope.highestForeclosure = region.name;
						} else {
							$scope.lowestForeclosure = region.name;
						}
					});
					$scope.foreclosurePercentage = Math.floor((two / totalLen) * 100);
				}

				console.log(one, two, totalLen)

				$scope.foreclosureComplete = true;
			}
			// radialProgress(document.getElementById('foreclosure'))
			// 	.label('Homes Foreclosed')
			// 	.diameter(150)
			// 	.value(data.Value)
			// 	.render();

			// d3.selectAll('svg.radial-svg')
			// .attr('height', '150')
			// .attr('width', '150');

			// d3.selectAll('svg.radial-svg>g')
			// .attr('transform', 'translate(22, 0)');
		});
	}
}]);