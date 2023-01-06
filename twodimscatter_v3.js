define(["jquery", "text!./twodimscatter_v3.css","./d3.min"], function($, cssContent) {'use strict';
	$("<style>").html(cssContent).appendTo("head");
	return {
		initialProperties : {
			version: 1.0,
			qHyperCubeDef : {
				qDimensions : [],
				qMeasures : [],
				qInitialDataFetch : [{
					qWidth : 5,
					qHeight : 1000
				}]
			}
		},
		definition : {
			type : "items",
			component : "accordion",
			items : {
				dimensions : {
					uses : "dimensions",
					min : 2,
					max: 2
				},
				measures : {
					uses : "measures",
					min : 3,
					max: 3
				},
				sorting : {
					uses : "sorting"
				},
				settings : {
					uses : "settings"
				}
			}
		},
		snapshot : {
			canTakeSnapshot : true
		},
		paint : function($element,layout) {
			
			//console.log(' SP Data returned: ', layout.qHyperCube);				//Added june 30
			var self = this,
					dimensions = layout.qHyperCube.qDimensionInfo,
					//data matrix
					matrix = layout.qHyperCube.qDataPages[0].qMatrix;
			// get qMatrix data array
			var qMatrix = layout.qHyperCube.qDataPages[0].qMatrix;
			// create a new array that contains the measure labels
			var measureLabels = layout.qHyperCube.qMeasureInfo.map(function(d) {
				return d.qFallbackTitle;
			});
			var measures = layout.qHyperCube.qMeasureInfo;				//Added june 30
			// Create a new array for our extension with a row for each row in the qMatrix 
			var data = qMatrix.map(function(d) {
				// for each element in the matrix, create a new object that has a property
				// for the grouping dimension, the first metric, and the second metric
			 	return {
			 		"Dim1":d[0].qText,
			 		"Metric1":d[2].qNum,								//Added june 30
			 		"Metric2":d[3].qNum,
					"Metric3":d[4].qNum,
					"Dim2":d[1].qText,
					"Metric3Text":d[4].qText							//Added this to handle the qNum bug which is not showing the value as expected
					
					
			 	}
			
			});
			//console.log(qMatrix);
			var range;
			
			if(measures[2].qMax != measures[2].qMin)
			{
				range = measures[2].qMax - measures[2].qMin;				//Added june 30
			}
			else{
				range = 0;
			}
			
			// Chart object width
			var width = $element.width();
			// Chart object height
			var height = $element.height();
			// Chart object id
			var id = "container_" + layout.qInfo.qId;

			// Check to see if the chart element has already been created
			if (document.getElementById(id)) {
				// if it has been created, empty it's contents so we can redraw it
				$("#" + id).empty();
				
			}
			else {
				// if it hasn't been created, create it with the appropiate id and size
			 	$element.append($('<div />').attr("id", id).width(width).height(height));
				/*$element.append($('<div />').attr({
                            "id": id
                        }).css({
                            height: height,
                            width: width//,
                            //overflow: 'auto'
                        }))*/
			}
            viz_2d_v3(data,measureLabels,width,height,id,self,qMatrix,range,measures);
		
		}
	};
});

var viz_2d_v3 = function (data,labels,width,height,id,self,qMatrix,range,measures) {
	
	// define chart margins, width, and height
	var margin = {top: 20, right: 20, bottom: 30, left: 40},
	    width = width - margin.left - margin.right,
	    height = height - margin.top - margin.bottom;

	// create a linear scale for the x-axis
	var x = d3.scale.linear()
	    .range([0, width]);

	// create a linear scale for the y-axis
	var y = d3.scale.linear()
	    .range([height, 0]);

	// create a color group
	var color = d3.scale.category10();

	// create the x-axis using the x-scale
	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	// create the y-axis using the y-scale
	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left");
	
	//var legendLenArray = qMatrix.map(function(d,i) { return qMatrix[i][0].qText.length; });
    var legendLenArray = data.map(function(d,i) { 
			//console.log(data[i].Dim1); 
			if(data[i].Dim1 !== undefined){
			
				return data[i].Dim1.length;
			}
			
		});
	//var legendArray = qMatrix.map(function(d,i) { return qMatrix[i][0].qText; });
	var legendArray = data.map(function(d,i) { 
			if(data[i].Dim1 !== undefined){
			
				return data[i].Dim1;
			}
		});
	legendArray = legendArray.filter(function(v,i) { return legendArray.indexOf(v) == i; });
	
	
	if(Math.max.apply(Math,legendLenArray) < 4)
	{
		
		var minMaxArray1 = [measures[0].qMin-25, measures[0].qMax+(80*((Math.ceil(legendArray.length/7))))];				//Added july 1, changed august 23 //40
	}
	else if(Math.max.apply(Math,legendLenArray) >= 4 && Math.max.apply(Math,legendLenArray) < 7)
	{
		var minMaxArray1 = [measures[0].qMin-25, measures[0].qMax+(150*((Math.ceil(legendArray.length/7))))];				//Added july 1, changed august 23 //70
	}
	else 
	{
		var minMaxArray1 = [measures[0].qMin-25, measures[0].qMax+(400*((Math.ceil(legendArray.length/7))))];				//Added july 1, changed august 23 //90
	}		
	
	
	//var minMaxArray1 = [0,measures[0].qMin, measures[0].qMax+150];				//Added july 1
	//var minMaxArray1 = [measures[0].qMin-25, measures[0].qMax+150];				//Added july 1, changed july 5
	var minMaxArray2 = [0,measures[1].qMin, measures[1].qMax+ 5];				//Added july 1, changed july 4
	
		
	// set the domain of the x-scale to be the metric 1 data
	//x.domain(d3.extent(data, function(d) { return d.Metric1; })).nice();
	x.domain(d3.extent(minMaxArray1)).nice();										//Added junne 30
	// set the domain of the y-scale to be the metric 2 data
	//y.domain(d3.extent(data, function(d) { return d.Metric2; })).nice();
	y.domain(d3.extent(minMaxArray2)).nice();										//Added junne 30
	
	// create the svg element with the appropriate width and height
	var svg = d3
		//.select("body")
		.select("#"+id).append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
		// add a group to that svg element for all of the subsequent visual elements.
	    // use this group to offset the positions of the sub-elements by the margins
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		.call(d3.behavior.zoom()
			.x(x)
            .y(y)
			.scaleExtent([0.5, 10])
			.on("zoom", function () {												//Zoom functionality
				
				svg.select("g.x.axis").call(xAxis);
				svg.select("g.y.axis").call(yAxis);
				
				svg.selectAll(".dot").attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
				//svg.selectAll(".dot").attr("transform", "translate(" + d3.event.translate[0]+",0" + ")" + " scale(" + d3.event.scale + ")")
							
			}));
			
	
	svg.append("rect")												//Added for zoom
      .attr("width", width)
      .attr("height", height);
	  
	var objects = svg.append("svg")									//Added for zoom
      .classed("objects", true)
      .attr("width", width)
      .attr("height", height);
	  
	
	// append a new group to the svg group that will create the xAxis
	// label it using our labels array
	svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis)
	    .append("text")
	      .attr("class", "label")
	      .attr("x", width)
	      .attr("y", -6)
	      .style("text-anchor", "end")
	      .text(labels[0]);

	// append a new group to the svg group that will create the yAxis
	// label it using our labels array
	svg.append("g")
		  .attr('id','yaxis')	
	      .attr("class", "y axis")
	      .call(yAxis)
	    .append("text")
	      .attr("class", "label")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text(labels[1]);
	
	
	
	// create the dots with our inputted data
	objects.selectAll(".dot")						//changed from svg to objects
	      .data(data)
	    .enter().append("circle")
	      .attr("class", "dot")
		  .attr('id','dot')										//Added july 1
	      .attr("r", function(d){												////Added june 30
				if(range == 0)								//Added july 1
				{
					return 40;
				}
				else
				{
					return Math.ceil(d.Metric3*30/(range));
				}
				//return d.Metric3*1.25;
			})
	      .attr("cx", function(d) { 
						//return x(d.Metric1);			// Added below code on 1/3/2017 to handle NaN
						if((d.Metric1) == 'NaN')
						{
							//console.log((d.Metric1) +" "+ x(d.Metric1));
							return null;
						}
							
						else 
						return x(d.Metric1);
						})
	      .attr("cy", function(d) { return y(d.Metric2); })
		  .attr("transform", function(d){
			  if(x(!d.Metric1) == 'NaN')
			  return "translate(" + x(d.Metric1) + "," + y(d.Metic2) + ")";
		  })
	      .style("fill", function(d) { /*console.log("ColorArray:"+d.Dim1+"  "+color(d.Dim1));*/ return color(d.Dim1); })
	//////////////////////////////////////////////////////////////////////
		.style("stroke", "#989898")	
		
		.on('click', function(d,i){															//On click event added june 30
			//console.log('Selections on click:' );
			
			var subjId;
			for(var j = 0; j < qMatrix.length; j++) {
				if(qMatrix[j][1].qText === d.Dim2) {
					subjId = qMatrix[j][1].qElemNumber;
					//console.log('Label on :'+qMatrix[j][1].qText);
					
				}
				
			}
			
			//console.log("Colorcode:"+d.Dim1+"  "+color(d.Dim1));
			self.backendApi.selectValues(1, [subjId], true);
			//self.selectValues(1, [subjId], true);
		})
		.append("title").text(function(d) {											// Added for tooltip added june 30
			//var str = d.Dim2;
			var str = "Subject: "+d.Dim2 +"\n Size By: "+ d.Metric3Text;
			return str;
		});
		//////////////////////////////////////////////
		/*var zoom = d3.behavior.zoom()
			.x(x)
            .y(y)
			.scaleExtent([0.5, 10])
			//.extent([0,0],[width,height])
			.on("zoom", function () {
				
				svg.select("g.x.axis").call(xAxis);
				svg.select("g.y.axis").call(yAxis);
				objects.selectAll(".dot").attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
				//objects.selectAll(".dot").attr("transform", "translate(" + d3.event.translate[0]+",0" + ")" + " scale(" + d3.event.scale + ")")
				console.log("d3.event.scale:"+d3.event.scale +" d3.event.translate"+d3.event.translate[0] +"  "+d3.event.translate[1]);
				console.log("d3.event:"+d3.event);
				
			});
			
		objects.call(zoom);*/
		
	/////////////////////////////////////////////////////////////////////////////////
	// create the legend group. use the group to position the legend
	var count = 0;
	
	var legend = svg.selectAll(".legend")
	      .data(color.domain()) //.data(legendArray)
		.enter().append("g")
	      .attr("class", "legend")
		  //.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
		  .attr("transform", function(d, i) {
			
				if(Math.max.apply(Math,legendLenArray) < 4)
				{
					return "translate("+parseInt(i/7)*(-50)+"," + (i%7) * 20 + ")";	
				}
				else if(Math.max.apply(Math,legendLenArray) >= 4 && Math.max.apply(Math,legendLenArray) < 7)
					return "translate("+parseInt(i/7)*(-70)+"," + (i%7) * 20 + ")";
				else 
					return "translate("+parseInt(i/7)*(-92)+"," + (i%7) * 20 + ")";
			})		
		
		  ;
		
	// add rectangles to the legend group
	legend.append("rect")
	    .attr("x", width - 18)
	    .attr("width", 18)
	    .attr("height", 18)
	    .style("fill", color)
		.on('click', function(d,i){															//On click event added august 23
			var leg;
			for(var j = 0; j < qMatrix.length; j++) {
				if(qMatrix[j][0].qText === d) {
					leg = qMatrix[j][0].qElemNumber;
				}
			}
			
			self.backendApi.selectValues(0, [leg], true);
			
		})
		.append("title").text(function(d) {											// Added for tooltip added August 23
			var str = d;
			return str;
		});
	// add text labels to the legend group
	legend.append("text")
	    .attr("x", width - 24)
	    .attr("y", 9)
	    .attr("dy", ".35em")
	    .style("text-anchor", "end")
	    .text(function(d) 
		{ 
			if(d.length > 10)
			{
				d = d.substring(0,10) + "...";
			}
			return d; 
		})
		.on('click', function(d,i){															//On click event added august 23
			var leg;
			for(var j = 0; j < qMatrix.length; j++) {
				if(qMatrix[j][0].qText === d) {
					leg = qMatrix[j][0].qElemNumber;
				}
			}
			self.backendApi.selectValues(0, [leg], true);
			
		})
		.append("title").text(function(d) {											// Added for tooltip added August 23
			var str = d;
			return str;
		});
	
}

