angular.module('app')
.factory('Minmax', function() {
	minmaxservice = {};

	minmaxservice.generateData = function(data, callback) {
		var highsale = data.highestSale === 'Unknown' ? data.highestList : data.highestSale;
		var lowsale = data.lowestSale === 'Unknown' ? data.lowestList : data.lowestSale; 
		var highrad;
		var lowrad;
		var highprofit;
		var lowprofit;
		var lowcostpercent = Math.floor((((lowsale - data.lowestList) / lowsale).toPrecision(4)) * 100);
		var highcostpercent = Math.floor((((highsale - data.highestList) / highsale).toPrecision(4)) * 100);
		highprofit = highcostpercent < 0 ? false : true;
		lowprofit = lowcostpercent < 0 ? false : true;
		lowcostpercent = Math.abs(lowcostpercent);
		highcostpercent = Math.abs(highcostpercent);
		highrad = radialProgress(document.getElementById('highsale'))
			.label(highprofit ? 'LOSS on HIGHEST cost' : 'PROFIT on HIGHEST cost')
			.diameter(150)
			.value(highcostpercent)
			.render();

		lowrad = radialProgress(document.getElementById('lowsale'))
			.label(highprofit ? 'LOSS on LOWEST cost' : 'PROFIT on LOWEST cost')
			.diameter(150)
			.value(lowcostpercent)
			.render();
		console.log(lowcostpercent);
		callback();

		d3.selectAll('svg.radial-svg')
			.attr('height', '150')
			.attr('width', '150');
		d3.selectAll('svg.radial-svg>g')
			.attr('transform', 'translate(22, 0)');
	}

	return minmaxservice;
})