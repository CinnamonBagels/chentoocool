angular.module('app')
.factory('Linechart', function() {
	var linechartservice = {};
	// var chart;
	// var percentArr = [1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015];
	// linechartservice.loadChart = function(data, callback) {
	// 	console.log(data);
	// 	var xs = {};
	// 	var arr = [];
	// 	var columns = [];
	// 	var pArr = percentArr.slice();
	// 	pArr.unshift('x1');
	// 	xs[data[0].RegionName] = 'x1';
	// 	data.forEach(function(d) {
	// 		arr.push(d.Value);
	// 	});
	// 	arr.unshift(data[0].RegionName);
	// 	console.log(xs,arr);

	// 	chart = c3.generate({
	// 		axis : {
	// 			x : {
	// 				tick : {
	// 					count : 100
	// 				}
	// 			}
	// 		},
	// 		data: {
	// 	        xs: xs,
	// 	        columns: [arr, pArr]
	// 	    }
	// 	})
	// }
	var margin = {top: 50, right: 100, bottom: 60, left: 50},
    width = $('#linegraphs').width() - margin.left - margin.right,
    height = $('#linegraphdiv').height() - margin.top - margin.bottom;
    var legend;

    var x = d3.time.scale().range([0, width]);

    var y = d3.scale.linear().range([height, 0]);
    var parseDate = d3.time.format('%m-%Y').parse,
    	formatDate = d3.time.format('%b, %Y'),
    	bisectDate = d3.bisector(function(d) { return d.date; }).left;
    var xAxis = d3.svg.axis()
    	.scale(x)
    	.orient('bottom');

    var yAxis = d3.svg.axis()
    	.scale(y)
    	.orient('left');

    var line = d3.svg.line()
    	.x(function(d) {
    		return x(d.date);
    	})
    	.y(function(d) {
    		return y(d.Value);
    	});
    	var called = false;
    var svg = d3.select('#linegraphs').append('svg')
    	.attr('width', width + margin.left + margin.right)
    	.attr('height', height + margin.top + margin.bottom)
    	.append('g')
    	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

   var lineSvg = svg.append('g');

   var focus = svg.append('g')
   				.style('display', 'none');
	linechartservice.loadChart = function(data, regions, callback) {
		if(!data[0]) return callback('error');
		data.forEach(function(d) {
			d.date = parseDate(d.Month + '-' + d.Year);
			d.Value = +d.Value;
		});

		x.domain(d3.extent(data, function(d) {
			return d.date;
		}));

		y.domain([0, 100]);

		svg.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(0' + ',' + height + ')')
		.call(xAxis);

		svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	    .append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .attr('dx', '-.71em')
	      .style("text-anchor", "end")
	      .text("% Sold for gain");

	      if(!called) {
	      	called = true;
	      	svg.append('path')
	      	.datum(data)
	      	.attr('class', 'line')
	      	.attr("data-legend", function(d) {
	      		var regionName;
	      		regions.forEach(function(region) {
	      			if(d[0].RegionName === region.zip)
	      				regionName = region.name;
	      		})

	      		return regionName;
	      	})
	      	.attr('data-legend-color', '#aae03a')
	      	.attr('d', line)
	      	.style('stroke', '#aae03a');

      	      legend = svg.append("g")
      		    .attr("class","legend")
      		    .attr("transform","translate(50,150)")
      		    .style("font-size","1.5em")
      		    .style("font-family","asap")
      		    .call(d3.legend)

      		   setTimeout(function() { 
      		       legend
      		         .style("font-size","1.5em")
      		         .attr("data-style-padding",10)
      		         .call(d3.legend)
      		     },1000)

      		   	    focus.append('circle')
      		   	    	.attr('class', 'y')
      		   	    	.style('fill', 'none')
      		   	    	.style('stroke', 'blue')
      		   	    	.attr('r', 4);


      		           // append the y line
      		           focus.append("line")
      		               .attr("class", "y")
      		               .style("stroke", "blue")
      		               .style("stroke-dasharray", "3,3")
      		               .style("opacity", 0.5)
      		               .attr("x1", width)
      		               .attr("x2", width);

      		   	    // append the x line
      		           focus.append("line")
      		               .attr("class", "x")
      		               .style("stroke", "blue")
      		               .style("stroke-dasharray", "3,3")
      		               .style("opacity", 0.5)
      		               .attr("y1", 0)
      		               .attr("y2", height);

      		           // place the value at the intersection
      		           focus.append("text")
      		               .attr("class", "y1")
      		               .style("stroke", "white")
      		               .style("stroke-width", "7.5px")
      		               .style("opacity", 1)
      		               .style('font-size', '2em')
      		               .attr("dx", 8)
      		               .attr("dy", "-.3em");
      		           focus.append("text")
      		               .attr("class", "y2")
      		               .attr("dx", 8)
      		               .attr("dy", "-.3em");

      		           // place the date at the intersection
      		           focus.append("text")
      		               .attr("class", "y3")
      		               .style("stroke", "white")
      		               .style("stroke-width", "7.5px")
      		               .style("opacity", 1)
      		               .style('font-size', '2em')
      		               .attr("dx", 8)
      		               .attr("dy", "1em");
      		           focus.append("text")
      		               .attr("class", "y4")
      		               .attr("dx", 8)
      		               .attr("dy", "1em");

      		          

      		   		    // append the rectangle to capture mouse               // **********
      		   	    svg.append("rect")                                     // **********
      		   	        .attr("width", width)                              // **********
      		   	        .attr("height", height)                            // **********
      		   	        .style("fill", "none")                             // **********
      		   	        .style("pointer-events", "all")                    // **********
      		   	        .on("mouseover", function() { focus.style("display", null); })
      		   	        .on("mouseout", function() { focus.style("display", "none"); })
      		   	        .on("mousemove", mousemove0);                       // **********

      		   	        return;
	      }
	      svg.append('path')
	      .datum(data)
	      .attr('class', 'line')
	      .attr("data-legend",function(d) { 
	      	var regionName;
	      	regions.forEach(function(region) {
	      		if(d[0].RegionName === region.zip)
	      			regionName = region.name;
	      	})

	      	return regionName;
	      })
	      .attr('data-legend-color', '#7a65f3')
	      .attr('d', line)
	      .style('stroke', '#7a65f3');


	    focus.append('circle')
	    	.attr('class', 'y')
	    	.style('fill', 'none')
	    	.style('stroke', 'blue')
	    	.attr('r', 4);


        // append the y line
        focus.append("line")
            .attr("class", "y")
            .style("stroke", "blue")
            .style("stroke-dasharray", "3,3")
            .style("opacity", 0.5)
            .attr("x1", width)
            .attr("x2", width);

	    // append the x line
        focus.append("line")
            .attr("class", "x")
            .style("stroke", "blue")
            .style("stroke-dasharray", "3,3")
            .style("opacity", 0.5)
            .attr("y1", 0)
            .attr("y2", height);

        // place the value at the intersection
        focus.append("text")
            .attr("class", "y1")
            .style("stroke", "white")
            .style("stroke-width", "7.5px")
            .style("opacity", 1)
            .style('font-size', '2em')
            .attr("dx", 8)
            .attr("dy", "-.3em");
        focus.append("text")
            .attr("class", "y2")
            .attr("dx", 8)
            .attr("dy", "-.3em");

        // place the date at the intersection
        focus.append("text")
            .attr("class", "y3")
            .style("stroke", "white")
            .style("stroke-width", "7.5px")
            .style("opacity", 1)
            .style('font-size', '2em')
            .attr("dx", 8)
            .attr("dy", "1em");
        focus.append("text")
            .attr("class", "y4")
            .attr("dx", 8)
            .attr("dy", "1em");

       

		    // append the rectangle to capture mouse               // **********
	    svg.append("rect")                                     // **********
	        .attr("width", width)                              // **********
	        .attr("height", height)                            // **********
	        .style("fill", "none")                             // **********
	        .style("pointer-events", "all")                    // **********
	        .on("mouseover", function() { focus.style("display", null); })
	        .on("mouseout", function() { focus.style("display", "none"); })
	        .on("mousemove", mousemove);                       // **********

	      function mousemove0() {
	      	var x0 = x.invert(d3.mouse(this)[0]),         
	      	    i = bisectDate(data, x0, 1),              
	      	    d0 = data[i - 1],                         
	      	    d1 = data[i],                             
	      	    d = x0 - d0.date > d1.date - x0 ? d1 : d0;

	      	focus.select("circle.y")                      
	      	    .attr("transform",                        
	      	          "translate(" + x(d.date) + "," +    
	      	                         y(d.Value) + ")");  

	      	  focus.select("text.y1")
	      	      .attr("transform",
	      	            "translate(" + x(d.date) + "," +
	      	                           y(d.Value) + ")")
	      	      .text(d.Value + '%')
	      	      .style('font-size', '2em')

	      	  focus.select("text.y2")
	      	      .attr("transform",
	      	            "translate(" + x(d.date) + "," +
	      	                           y(d.Value) + ")")
	      	      .text(d.Value + '%')
	      	      .style('font-size', '2em');

	      	  focus.select("text.y3")
	      	      .attr("transform",
	      	            "translate(" + x(d.date) + "," +
	      	                           y(d.Value) + ")")
	      	      .text(formatDate(d.date))
	      	      .style('font-size', '2em');

	      	  focus.select("text.y4")
	      	      .attr("transform",
	      	            "translate(" + x(d.date) + "," +
	      	                           y(d.Value) + ")")
	      	      .text(formatDate(d.date))
	      	      .style('font-size', '2em');

	      	  focus.select(".x")
	      	      .attr("transform",
	      	            "translate(" + x(d.date) + "," +
	      	                           y(d.Value) + ")")
	      	                 .attr("y2", height - y(d.Value));

	      	  focus.select(".y")
	      	      .attr("transform",
	      	            "translate(" + width * -1 + "," +
	      	                           y(d.Value) + ")")
	      	                 .attr("x2", width + width); 
	      }

		 function mousemove() {                            
	        var x0 = x.invert(d3.mouse(this)[0]),         
	            i = bisectDate(data, x0, 1),              
	            d0 = data[i - 1],                         
	            d1 = data[i],                             
	            d = x0 - d0.date > d1.date - x0 ? d1 : d0;

	        focus.select("circle.y")                      
	            .attr("transform",                        
	                  "translate(" + x(d.date) + "," +    
	                                 y(d.Value) + ")");  

	          focus.select("text.y1")
	              .attr("transform",
	                    "translate(" + x(d.date) + "," +
	                                   y(d.Value) + ")")
	              .text(d.Value + '%')
	              .style('font-size' , '1.5em')
	              .style('font-family' , 'asap')
	              .style('font-weight' , 'bold');

	          focus.select("text.y2")
	              .attr("transform",
	                    "translate(" + x(d.date) + "," +
	                                   y(d.Value) + ")")
	              .text(d.Value + '%')
	              .style('font-size' , '1.5em')
	              .style('font-family' , 'asap')
	              .style('font-weight' , 'bold');

	          focus.select("text.y3")
	              .attr("transform",
	                    "translate(" + x(d.date) + "," +
	                                   y(d.Value) + ")")
	              .text(formatDate(d.date))
	              .style('font-size' , '1.5em')
	              .style('font-family' , 'asap')
	              .style('font-weight' , 'bold')

	          focus.select("text.y4")
	              .attr("transform",
	                    "translate(" + x(d.date) + "," +
	                                   y(d.Value) + ")")
	              .text(formatDate(d.date))
	              .style('font-size' , '1.5em')
	              .style('font-family', 'asap')
	              .style('font-weight' , 'bold')

	          focus.select(".x")
	              .attr("transform",
	                    "translate(" + x(d.date) + "," +
	                                   y(d.Value) + ")")
	                         .attr("y2", height - y(d.Value));

	          focus.select(".y")
	              .attr("transform",
	                    "translate(" + width * -1 + "," +
	                                   y(d.Value) + ")")
	                         .attr("x2", width + width); 
	    }    
	    callback();               
	}
	return linechartservice;
})