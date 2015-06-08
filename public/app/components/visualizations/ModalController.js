angular.module('app')
.controller('ModalController', ['$scope', '$modalInstance', function($scope, $modalInstance) {
	// function initialize() {
	//     var mapOptions = {
	//       zoom: 10,
	//       center: {lat: 32.715738, lng: -117.161084},
	//       disableDoubleClickZoom : true,
	//       streetViewControl : false
	//     };
	//     var infowindow;
	//     var geocoder = new google.maps.Geocoder();
	//     var map = new google.maps.Map(document.getElementById('map'),
	//         mapOptions);

	//     map.data.loadGeoJson('./zillowneighborhoodsca.geojson');

	//     map.data.setStyle(function(feature) {
	//     	var color;

	//     	if(!feature.getProperty('isColorful')) {
	//     		color = 'grey';
	//     	} else {
	//     		color = 'green';
	//     	}

	//     	return {
	//     		fillColor : color,
	//     		strokeColor : color,
	//     		strokeWeight : 1
	//     	};
	//     });
	//     map.data.addListener('click', function(event) {
	//     	var address;
	//     	var zip;
	//     	geocoder.geocode({ 
	//     		location : {
	// 	    		lat : event.latLng.lat(), 
	// 	    		lng : event.latLng.lng() 
	//     		}
	//     	}, function(data, status) {
	//     		if(status === 'OK') {
	// 	    		address = data[0].address_components;
	// 	    		zip = address[address.length - 2].long_name;
	// 	    		if(isNaN(zip)) {
	// 	    			zip = address[address.length - 1].long_name;
	// 	    		}


	// 	    		if(event.feature.getProperty('isColorful')) {
	// 	    			event.feature.setProperty('isColorful', false);
	// 	    			regions.forEach(function(region) {

	// 	    			})
	// 	    		} else {
	// 	    			var exists = false;
	// 	    			event.feature.setProperty('isColorful', true);
	// 	    			regions.some(function(region) {
	// 	    				if(event.feature.getProperty('NAME') === region.name) {
	// 	    					exists = true;
	// 	    					return true;
	// 	    				}
	// 	    			});
	// 	    			if(!exists) {
	// 	    				regions.push({
	// 	    					zip : zip,
	// 	    					name : event.feature.getProperty('NAME')
	// 	    				});
	// 	    			}
	// 	    		}
	//     		} else {
	//     			//error
	//     			//you are clicking too fast error.
	//     		}
	//     	});
	//     });
	//     var marker;
	//     map.data.addListener('mouseover', function(event) {
	//     	var point = event.latLng;
	//     	var name = event.feature.getProperty('NAME');
	//     	map.data.overrideStyle(event.feature, { strokeWeight : 3 });

	//     });
	//     map.data.addListener('mouseout', function(event) {
	//     	map.data.revertStyle();
	//     });
	//   }

	  $scope.close = function(reason) {
	  	$modalInstance.close(reason);
	  }
}]);