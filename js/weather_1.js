
	function get_graph(name,color,unit){
	
		// dimensions and margins of the graph
		var margin = {top: 10, right:0, bottom: 0, left:-150},
		    width = 1100 - margin.left - margin.right,
		    height = 350 - margin.top - margin.bottom;
		
		var width_score = 150
		var width_s = width -width_score
		
	
		// svg object
			var svg = d3.select("#my_dataviz")
			  .append("svg")
			    .attr("width", width + margin.left + margin.right)
			    .attr("height", height + margin.top + margin.bottom)
			  .append("g")
			    .attr("transform",
			          "translate(" + margin.left + "," + margin.top + ")");
		    
		d3.csv("data/sick_meteo2.csv", function(row) {
		  return {date: row.date, count: row.count, 
		  		  avg_temp: row.avg_temp,
		  		  avg_hum: row.avg_relative_humidity,
		  		  avg_rain:row.precipitation,
		  		  avg_wind:row.max_wind_speed
		  		  }
		}).then(function(d){
			
			// adapt data to different weather features
			var avg_feat = d3.nest()
			  	.key(function(d1) {return d1.date; })
			  	.rollup(function(v) { return d3.mean(v, function(d1) { return d1.avg_temp}); })
			  	.entries(d);

			if (name == 'Temperature'){
				avg_feat = d3.nest()
			  	.key(function(d1) {return d1.date; })
			  	.rollup(function(v) { return d3.mean(v, function(d1) { return d1.avg_temp}); })
			  	.entries(d);
		  	}
  	
		  	else if(name == 'Humidity'){
				avg_feat = d3.nest()
			  	.key(function(d1) {return d1.date; })
			  	.rollup(function(v) { return d3.mean(v, function(d1) { return d1.avg_hum}); })
			  	.entries(d);
		  	}
  	
		  	else if(name == 'Rain'){
				 avg_feat = d3.nest()
			  	.key(function(d1) {return d1.date; })
			  	.rollup(function(v) { return d3.mean(v, function(d1) { return d1.avg_rain}); })
			  	.entries(d);
		  	}
  	
		  	else if(name == 'Wind'){
				avg_feat = d3.nest()
			  	.key(function(d1) {return d1.date; })
			  	.rollup(function(v) { return d3.mean(v, function(d1) { return d1.avg_wind}); })
			  	.entries(d);
		  	}
  	
		  	var nb_patient = d3.nest()
		  	.key(function(d1) {return d1.date; })
		  	.rollup(function(v) { return d3.sum(v, function(d1) { return d1.count}); })
		  	.entries(d);
		   	
		   	var mapped_count_0 = nb_patient.map(d => {
		  	return {date: new Date(d.key),value: d.value,rayon:3}});
		
			var mapped_feat_0 = avg_feat.map(d => {
		  	return {date: new Date(d.key),value: d.value,rayon:3}});
		  	
			// functions to adapt values accortding to selected time lag
			
			function reduce_left(mapped,nb) { 
		  		return mapped.slice(nb);
			}
			
			function reduce_right(mapped,nb) { 
		  		return mapped.slice(0,mapped.length-nb);
			}
		  	
			function clean_right(mapped,nb) {
				for (let i = 0; i < mapped.length; i++) {
		  				if(i>=mapped.length-nb){
		  					mapped[i].rayon =0;
		  				}
		  				else{
		  					mapped[i].rayon =2;
		  				}
					} 
		  		return mapped;
			}
  	
		  	function clean_left(mapped,nb) {
				for (let i = 0; i < mapped.length; i++) {
		  				if(i<= nb){
		  					mapped[i].rayon =0;
		  				}
		  				else{
		  					mapped[i].rayon =2;
		  				}
					} 
		  		return mapped;
			}
  	
		  	function initialize_circles(mapped){
				var mapped_init = []
				var dic = {date:40,value:40,rayon:0}
				for (let i = 0; i < mapped.length; i++) {
			  			mapped_init.push(dic)
						} 
			  		return mapped_init;
				}
  	 	
		  	var mapped_count = reduce_left(mapped_count_0,0)
			var mapped_feat = reduce_right(mapped_feat_0,0)
			
	
		  	var count = Object.keys(mapped_count).map(e => parseFloat(mapped_count[e].value));
			var feat = Object.keys(mapped_feat).map(e => parseFloat(mapped_feat[e].value));
	
			var R = pcorr(count,feat);
			var R_mapped = [{'value':Math.round(R*100)/100}];
			
			var minDate_1 = get_min_date(mapped_count);
		  	var maxDate_1 = get_max_date(mapped_count);
		  
		  	var minDate_2 = get_min_date(mapped_feat);
		  	var maxDate_2 = get_max_date(mapped_feat);
		  
		  	var minFeat = get_min_value(mapped_feat);
		  	var maxFeat = get_max_value(mapped_feat);
		  	
		  	var minCount = get_min_value(mapped_count);
		  	var maxCount= get_max_value(mapped_count);
		  	
  	// the two x axis 
  	var xScale1 = d3.scaleTime()
  	.nice(d3.timeDay)
    .range([0,width_s])
  	
  	var xScale2 = d3.scaleTime()
    .range([0,width_s]);
    
  	var xAxis1 = d3.axisBottom()
	  .ticks(10)
	  
 	var xAxis2 = d3.axisTop()
	  .ticks(10)
  	  	
  	// the two y axis 
  	var yScale1 = d3.scaleLinear()
    .domain([0,maxCount])
    .range([height,0])
  	
  	var yScale2 = d3.scaleLinear().
  	domain([minFeat,maxFeat])
  	.range([height, 0]);
  	
  	var yScale3 = d3.scaleLinear().
  	domain([-1,1])
  	.range([height, 0]);
  	
  	// Y-axis
  	var yAxis1 =  d3.axisLeft()
	  .scale(yScale1)
	  .ticks(10)
	       
  	var yAxis2 =  d3.axisRight()
		.scale(yScale2)
		.ticks(10) 
	
	var yAxis3 =  d3.axisLeft()
		.scale(yScale3)
		.ticks(10) 
		
   var svgContainer = d3.select("body").append("svg");
  
	// Y axis correlation
	svg.append('g').data(R_mapped)
      .attr('class', 'axis')  
      .attr('transform','translate(' + width + ',0)')    
      .call(yAxis3)
      .append('text') // y-axis Label
       .attr("font-family", "Saira")
      .attr('class','label')
      .attr('x',+70)
      .attr('y',-33)
      .attr('dy','.71em')
      .style('text-anchor','end')
      .style("font-family",'Harman Sans')
      .style("font", "18px times")
      .text('Pearson correlation')
  	  .style("fill", "black")
	  
	
	// X-axis
	 var pos = height +10
	 x_axis_real1 = svg.append('g')
	 		 .attr("font-family", "century")
	      .attr('class','axis')
	      .attr('transform', 'translate(0,' + pos + ')')
	  	  .attr("stroke","#0D47A1")
	  	   
	 x_axis_real2 =svg.append('g')
	      .attr('class','axis')
	      .attr('transform', 'translate(0,-10)')
	      .attr("stroke",color)
	      
	  // Y-axis
	  svg.append('g').data(mapped_count)
	      .attr('class', 'axis')
	       .attr("stroke","#0D47A1")
	      .call(yAxis1)
	      .append('text') // y-axis Label
	      .attr('class','label')
	      .attr('transform','rotate(-90)')
	      .attr('x',-height/2 + 60)
	      .attr('y',-40)
	      .attr('dy','.71em')
	      .style('text-anchor','end')
	      .style("font", "15px times")
	      .text('Nb new cases')
	  	  .style("text-decoration", "oblique")
	  	  
	  svg.append('g').data(mapped_feat)
	      .attr('class', 'axis')
	       .attr("stroke",color) 
	      .attr('transform','translate('+ width_s +',0)')    
	      .call(yAxis2)
	      .append('text') // y-axis Label
	      .attr('class','label')
	      .attr('transform','rotate(-90)')
	      .attr("stroke",color)
	      .attr('x',-height/2 + 70)
	      .attr('y',+25)
	      .attr('dy','.71em')
	      .style('text-anchor','end')
	      .style("font", "15px times")
	      .text(name+ ' ('+unit+')')
	  	  .style("fill", color)
       
	   var formatTime = d3.timeFormat("%B %d, %Y")
	                    
	   path1 = svg.append("path")
	    		
		      	
	   path2 = svg.append("path")
		      
	   var CorCircle = svg.selectAll('CorCircle')
		      .data(R_mapped)
		      .enter()
		      .append('circle')
		      .attr('cx',width)
		      .attr('cy',function (d) { return yScale3(d.value) })
		      .attr('r','5')
		      .attr('stroke','')
		      .attr('fill','#ffb142')
			  .attr('stroke','#1B1464')
		
		var mapped_init_1 = initialize_circles(mapped_count);
		
		var mapped_init_2 = initialize_circles(mapped_feat);
	
	// when the input range changes update the circle 
	d3.select("#time_lag").on("input", function() {
	  update(+this.value);
	});
		
	var circles_count= svg.selectAll('circle_count')
	      .data(mapped_init_1)
	      .enter()
	      .append('circle')
	      .attr('cx',function (d) { return d.date })
	      .attr('cy',function (d) { return d.date } )
	      .attr('r','1')
	      .attr('stroke','')
	      .attr('fill','orange')
	
	var circles_feat= svg.selectAll('circle_feat')
	      .data(mapped_init_2)
	      .enter()
	      .append('circle')
	      .attr('cx',function (d) { return d.date })
	      .attr('cy',function (d) { return d.date } )
	      .attr('r','1')
	      .attr('stroke','')
	      .attr('fill','orange')
	
	label1 = svg
        .append('g')
        .append("text")
    
    label2 = svg
        .append('g')
        .append("text")
   
// update the elements
function update(time_lag) {

  // adjust the text on the range slider
  d3.select("#nRadius-value").text(time_lag);
  d3.select("#nRadius").property("value", time_lag);
	
  mapped_count = reduce_left(mapped_count_0,time_lag)
  mapped_count_clean = clean_left(mapped_count_0,time_lag)
  mapped_feat = reduce_right(mapped_feat_0,time_lag)
  mapped_feat_clean = clean_right(mapped_feat_0,time_lag)
  
  count = Object.keys(mapped_count).map(e => parseFloat(mapped_count[e].value));
  feat = Object.keys(mapped_feat).map(e => parseFloat(mapped_feat[e].value));

  console.log('time_lag: ',time_lag)

  
  R = pcorr(count,feat);
  R_mapped = [{'value':Math.round(R*100)/100}]

	
  // update the correlation circle radius
  CorCircle.attr('cy',function (d) { return yScale3(R) })
  .on('mouseover', function () {
        d3.select(this)
          .transition()
          .duration(500)
          .attr('r',10)
          .attr('stroke-width',3)
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(500)
          .attr('r',5)
          .attr('stroke-width',1)
      })
      .append('title') // Tooltip
      .text('\nPearson correlation between two variables: ' + Math.round(R*100)/100)
  
  minDate_1 = get_min_date(mapped_count);
  maxDate_1 = get_max_date(mapped_count);
  
  minDate_2 = get_min_date(mapped_feat);
  maxDate_2 = get_max_date(mapped_feat);
  
  xScale1.domain([minDate_1, maxDate_1])
  xScale2.domain([minDate_2, maxDate_2])
  
  xAxis1.scale(xScale1)
  xAxis2.scale(xScale2)
  
  x_axis_real1.call(xAxis1)
      .append('text') // X-axis Label
      .attr('class','label')
      .attr('y',35)
      .attr('x',width_s/2 +100)
      .style('text-anchor','end')
      .style("font", "18px times")
  	  .style("fill", "blue")
  	  
  x_axis_real2.call(xAxis2)     
  	  .append('text') // X-axis Label
      .attr('class','label')
      .attr('y',-35)
      .attr('x',width_s/2 +75 )
      .style('text-anchor','end')
      .style("font", "18px times")
  	  .style("fill", color)
  	  
   path1.datum(mapped_count)
	      .attr("fill", "none")
	      .attr("stroke", "#0D47A1")
	      .attr("stroke-width", 1.5)
	      .attr("d", d3.line()
	        .x(function(d) { return xScale1(d.date) })
	        .y(function(d) { return yScale1(d.value)  })
	        )

   path2.datum(mapped_feat)
	      .attr("fill", "none")
	      .attr("stroke", color)
	      .attr("stroke-width", 1.5)
	      .attr("d", d3.line()
	        .x(function(d) { return xScale2(d.date) })
	        .y(function(d) { return yScale2(d.value)  })
	        )
	
	var date_end_feat = mapped_feat[2]
	var date_end_count = mapped_count[mapped_count.length -4]
	
	label1.attr("transform", function(d) { return "translate(" + xScale2(date_end_feat.date) + "," + yScale2(date_end_feat.value) + ")"; }) // Put the text at the position of the last point
          .attr("x",-20) 
          .attr("y", -15) 
          .text(function(d) {return name; })
          .style("fill", color)
          .style("font-size", 12)
          
    label2.attr("transform", function(d) { return "translate(" + xScale1(date_end_count.date) + "," + yScale1(date_end_count.value) + ")"; }) // Put the text at the position of the last point
          .attr("x", -95)
          .attr("y", +5)
          .text(function(d) {return 'nb new cases'; })
          .style("fill", '#0D47A1')
          .style("font-size", 12)
          
	circles_count
      .data(mapped_count_clean)
      .attr('cx', function (d) { return xScale1(d.date) })
      .attr('cy', function (d) { return yScale1(d.value) })
      .attr('r', function (d) { return d.rayon })
      .attr('stroke','#0D47A1')
      .attr('fill','#0D47A1')
      .on('mouseover', function () {
        d3.select(this)
          .transition()
          .duration(500)
          .attr('r',8)
          .attr('stroke-width',4)
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(500)
          .attr('r',2)
          .attr('stroke-width',1)
      })
      .append('title') // Tooltip
      .text(function (d) { return '\nNb new cases: ' + d.value +
                           '\nDay: ' + formatTime(new Date(d.date))})
	
	circles_feat 
      .data(mapped_feat_clean)
      .attr('cx', function (d) { return xScale2(d.date) })
      .attr('cy', function (d) { return yScale2(d.value) })
      .attr('r', function (d) { return d.rayon })
      .attr('stroke',color)
      .attr('fill',color)
	  .on('mouseover', function () {
        d3.select(this)
          .transition()
          .duration(500)
          .attr('r',8)
          .attr('stroke-width',4)
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(500)
          .attr('r',2)
          .attr('stroke-width',1)
      })
      .append('title') // Tooltip
      .text(function (d) { return '\n'+name+': ' + Math.round(d.value*10)/10 +'\ '+unit +
                           '\nDay: ' + formatTime(new Date(d.date))}) 
	
	d3.selectAll("text")
  .style('font-family', 'Harman Simple') 	 
		
var clip = svg.append("defs").append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", width )
      .attr("height", height )
      .attr("x", 0)
      .attr("y", 0);
	
  // brush feature
 var brush = d3.brushX()                
      .extent( [ [0,height*0.9], [width_s,height] ] ) 
      .on("end", updateChart) 

  var scatter = svg.append('g')
    .attr("clip-path", "url(#clip)")
    
  // Brushing
  scatter
    .append("g")
      .attr("class", "brush")
      .call(brush);

  var idleTimeout
  function idled() { idleTimeout = null; }

  // Update the chart 
  function updateChart() {

    extented = d3.event.selection

    
    if(!extented){
      if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
      xScale1.domain([ minDate_1, maxDate_1])
      xScale2.domain([ minDate_2, maxDate_2])
    }else{
      xScale1.domain([ xScale1.invert(extented[0]), xScale1.invert(extented[1]) ])
      xScale2.domain([ xScale2.invert(extented[0]), xScale2.invert(extented[1]) ])
      scatter.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
    	x_axis_real1.transition().duration(1000).call(d3.axisBottom(xScale1))
    
    }
	
	circles_count 
      .transition().duration(1000)
      .attr("cx", function (d) { return get_x1(d); } )
      .attr("cy", function (d) { return get_y1(d); } )
      
    circles_feat 
      .transition().duration(1000)
      .attr("cx", function (d) { return get_x2(d); } )
      .attr("cy", function (d) { return get_y2(d); } )
	  .attr('r', function (d) { return get_r2(d) })
	
	console.log(yScale1(200))
    // Update axis and circle position
    
    
    path1.attr("d", d3.line()
	        .x(function(d) {  return get_x1(d) })
	        .y(function(d) { return get_y1(d)  }))
   
    path2.attr("d", d3.line()
	        .x(function(d) {  return get_x2(d) })
	        .y(function(d) { return get_y2(d)  }))
   
    x_axis_real2.transition().duration(1000).call(d3.axisTop(xScale2))
	
	
	// functions to get right x and y values when zooming
	function get_max1(mapped_count){
		var i;
		var indice_out = [];
		for (i = 0; i < mapped_count.length; i++) {
  			if(xScale1(mapped_count[i].date)> width_s){
  				indice_out.push(i)
  			}
		}
		if(indice_out.length>0){
			return indice_out
		}
		else{
			var out = [mapped_count.length -1]
			return out
		}
	}
	
	function get_max2(mapped_feat){
		var i;
		var indice_out_2 = [];
		for (i = 0; i < mapped_feat.length; i++) {
  			if(xScale2(mapped_feat[i].date)> width_s){
  				indice_out_2.push(i)
  			}
		}
		if(indice_out_2.length>0){
			return indice_out_2
		}
		else{
			var out_2 = [mapped_feat.length -1]
			return out_2
		}
	}
	
	
	function get_min1(mapped_count){
		var i;
		var indice_out_min1 = [];
		for (i = 0; i < mapped_count.length; i++) {
  			if(xScale1(mapped_count[i].date)<0){
  				indice_out_min1.push(i)
  			}
		}
		if(indice_out_min1.length>0){
			return indice_out_min1
		}
		else{
			var out = [0,0]
			return out
		}
	}
	
	function get_min2(mapped_count){
		var i;
		var indice_out_min2 = [];
		for (i = 0; i < mapped_feat.length; i++) {
  			if(xScale2(mapped_feat[i].date)<0){
  				indice_out_min2.push(i)
  			}
		}
		if(indice_out_min2.length>0){
			return indice_out_min2
		}
		else{
			var out = []
			return out
		}
	}
	
	
	function get_x1(d){
		if(xScale1(d.date)<width_s && xScale1(d.date)>0 ){
		return xScale1(d.date)
		}
		else if (xScale1(d.date)>width_s){
			return xScale1(mapped_count[get_max1(mapped_count)[0]-1].date);
		}
		
		else if (xScale1(d.date)<0){
			return xScale1(mapped_count[get_min1(mapped_count).length].date);
		}
	}
	
	function get_x2(d){
		if(xScale2(d.date)<width_s && xScale2(d.date)>0 ){
		return xScale2(d.date)
		}
		else if (xScale2(d.date)>width_s){
			return xScale2(mapped_feat[get_max2(mapped_count)[0]-1+time_lag].date);
		}
		
		else if (xScale2(d.date)<0){
			return xScale2(mapped_feat[get_min2(mapped_count).length].date);
		}
	}
	
	function get_r2(d){
		if(xScale2(d.date)<width_s && xScale2(d.date)>0 ){
		return 3
		}
		else if (xScale2(d.date)>width_s){
			return 0;
		}
		
		else if (xScale2(d.date)<0){
			return 0;
		}
	}
	
	console.log(time_lag)
	function get_y1(d){
		if(xScale1(d.date)<width_s && xScale1(d.date)>0 ){
		return yScale1(d.value)
		}
		else if (xScale1(d.date)>width_s){
			return yScale1(mapped_count[get_max1(mapped_count)[0]-1].value);
		}
		else if (xScale1(d.date)<=0){
			return yScale1(mapped_count[get_min1(mapped_count).length].value);
		}
	}
	
	function get_y2(d){
		if(xScale2(d.date)<width_s && xScale2(d.date)>0){
		return yScale2(d.value)
		}
		else if (xScale2(d.date)>width_s){
			
			if(get_max2((mapped_feat)[0]+time_lag < mapped_feat.length)){
			   return yScale2(   mapped_feat[   get_max2(  (mapped_feat)[0]-1+time_lag )  ]  )
			   
			   }
			else{  return yScale2(mapped_feat[get_max2((mapped_feat)[0] )]) 
				
			}
		}
		else if (xScale2(d.date)<0){
			return yScale2(mapped_feat[get_min2(mapped_feat).length].value);
		}
	}
	
	
	d3.selectAll("text")
  	.style('font-family', 'Harman Simple') 	 
	
    }
}

update(0)
d3.selectAll("text")
  .style('font-family', 'Harman Simple')   

});

}

get_graph('Temperature','red','°C')

function update1(a) {
	
	if (a == 'Temp') {
		d3.select("#my_dataviz").selectAll("svg").remove();
    	get_graph('Temperature','red','°C')
  		
  	} else if (a == 'Hum') {
  		d3.select("#my_dataviz").selectAll("svg").remove();
    	get_graph('Humidity','orange','%')	
	}
	else if (a == 'Wind') {
    	d3.select("#my_dataviz").selectAll("svg").remove();
    	get_graph('Wind','green','km/h')
	}
	else if (a == 'Rain') {
    	d3.select("#my_dataviz").selectAll("svg").remove();
    	get_graph('Rain','grey','mm')
	}
	
	
}
function get_min_date(mapped) {
  return d3.min(mapped, function(d) { return d.date; });
}

function get_max_date(mapped) {
  return d3.max(mapped, function(d) { return d.date; });
}

function get_min_value(mapped) {
  return d3.min(mapped, function(d) { return d.value; });
}

function get_max_value(mapped) {
  return d3.max(mapped, function(d) { return d.value; });
}

const pcorr = (x, y) => {
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0,
    sumY2 = 0;
  const minLength = x.length = y.length = Math.min(x.length, y.length),
    reduce = (xi, idx) => {
      const yi = y[idx];
      sumX += xi;
      sumY += yi;
      sumXY += xi * yi;
      sumX2 += xi * xi;
      sumY2 += yi * yi;
    }
  x.forEach(reduce);
  return (minLength * sumXY - sumX * sumY) / Math.sqrt((minLength * sumX2 - sumX * sumX) * (minLength * sumY2 - sumY * sumY));
};
