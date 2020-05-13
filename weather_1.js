

	// set the dimensions and margins of the graph
	var margin = {top: 10, right:0, bottom: 30, left:0},
	    width = 800 - margin.left - margin.right,
	    height = 500 - margin.top - margin.bottom;
	
	var width_score = 100
	var width_s = width -width_score
	// append the svg object to the body of the page
	var svg = d3.select("#my_dataviz")
	  .append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform",
	          "translate(" + margin.left + "," + margin.top + ")");


	d3.csv("data/essai.csv", function(row) {
	  return {date: row.date, count: row.count, avg_temp: row.avg_temp}
	}).then(function(d){

	var avg_temp = d3.nest()
  	.key(function(d1) {return d1.date; })
  	.rollup(function(v) { return d3.mean(v, function(d1) { return d1.avg_temp}); })
  	.entries(d);
   	
   	var mapped_count_0 = d.map(d => {
  	return {date: new Date(d.date),value: d.count,rayon:7}});

	var mapped_temp_0 = avg_temp.map(d => {
  	return {date: new Date(d.key),value: d.value,rayon:7}});
  	
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
  					mapped[i].rayon =7;
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
  					mapped[i].rayon =7;
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
	var mapped_temp = reduce_right(mapped_temp_0,0)
	
	
  	var count = Object.keys(mapped_count).map(e => parseFloat(mapped_count[e].value));
	var temp = Object.keys(mapped_temp).map(e => parseFloat(mapped_temp[e].value));
	
	var R = pcorr(count,temp);
	var R_mapped = [{'value':Math.round(R*100)/100}];
	
	var minDate_1 = get_min_date(mapped_count);
  	var maxDate_1 = get_max_date(mapped_count);
  
  	var minDate_2 = get_min_date(mapped_temp);
  	var maxDate_2 = get_max_date(mapped_temp);
  
  	var minTemp = get_min_value(mapped_temp);
  	var maxTemp = get_max_value(mapped_temp);
  	
  	var minCount = get_min_value(mapped_count);
  	var maxCount= get_max_value(mapped_count);
  	
  	
  	var xScale1 = d3.scaleTime()
    .range([0,width_s]);
  
  	var xScale2 = d3.scaleTime()
    .range([0,width_s]);
    
  	var xAxis1 = d3.axisBottom()
	  .ticks(5)
	  
 	var xAxis2 = d3.axisBottom()
	  .ticks(5)
  	
  	var yScale1 = d3.scaleLinear()
    .domain([0,maxCount])
    .range([height,0])
  	
  	var yScale2 = d3.scaleLinear().
  	domain([minTemp,maxTemp])
  	.range([height, 0]);
  	
  	var yScale3 = d3.scaleLinear().
  	domain([-1,1])
  	.range([height, 0]);
  	
  	// Y-axis
  	var yAxis1 =  d3.axisLeft()
	  .scale(yScale1)
	  .ticks(5)
	  
  	var yAxis2 =  d3.axisLeft()
		.scale(yScale2)
		.ticks(5) 
		
	var yAxis3 =  d3.axisLeft()
		.scale(yScale3)
		.ticks(5) 
		
   var svgContainer = d3.select("body").append("svg");
   /*                      
   var c_corr = svg.selectAll('c_corr')
      .data(R_mapped)
      .enter()
      .append('circle')
      .attr('cx',width)
      .attr('cy',function (d) { return yScale3(d.value) })
      .attr('r','10')
      .attr('stroke','blue')
      .attr('fill','orange')
   	  .on('mouseover', function () {
        d3.select(this)
          .transition()
          .duration(500)
          .attr('r',15)
          .attr('stroke-width',3)
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(500)
          .attr('r',8)
          .attr('stroke-width',1)
      })
      .append('title') // Tooltip
      .text(function (d) { return '\nCorrelation score between variables: ' + d.value})
   */
// Y axis correlation
	svg.append('g').data(R_mapped)
      .attr('class', 'axis')  
      .attr('transform','translate(' + width + ',0)')    
      .call(yAxis3)
      .append('text') // y-axis Label
      .attr('class','label')
      .attr('x',+80)
      .attr('y',-33)
      .attr('dy','.71em')
      .style('text-anchor','end')
      .style("font", "18px times")
      .text('Spearson correlation:')
  	  .style("fill", "black")

// X-axis
 x_axis_real1 = svg.append('g')
      .attr('class','axis')
      .attr('transform', 'translate(0,' + height + ')')
  	  
 x_axis_real2 =svg.append('g')
      .attr('class','axis')
      .attr('transform', 'translate(0,0)')
      
  // Y-axis
  svg.append('g').data(mapped_count)
      .attr('class', 'axis')      
      .call(yAxis1)
      .append('text') // y-axis Label
      .attr('class','label')
      .attr('transform','rotate(-90)')
      .attr('x',-10)
      .attr('y',-40)
      .attr('dy','.71em')
      .style('text-anchor','end')
      .style("font", "18px times")
      .text('Nb cases')
  	  .style("fill", "blue")
  	  
  svg.append('g').data(mapped_temp)
      .attr('class', 'axis')  
      .attr('transform','translate('+ width_s +',0)')    
      .call(yAxis2)
      .append('text') // y-axis Label
      .attr('class','label')
      .attr('transform','rotate(-90)')
      .attr('x',-10)
      .attr('y',+15)
      .attr('dy','.71em')
      .style('text-anchor','end')
      .style("font", "18px times")
      .text('Weather feature')
  	  .style("fill", "red")
       
   var formatTime = d3.timeFormat("%B %d, %Y")
                    
   path1 = svg.append("path")
	      
   path2 = svg.append("path")
	      
   var CorCircle = svg.selectAll('CorCircle')
	      .data(R_mapped)
	      .enter()
	      .append('circle')
	      .attr('cx',width)
	      .attr('cy',function (d) { return yScale3(d.value) })
	      .attr('r','10')
	      .attr('stroke','')
	      .attr('fill','orange')

	
	var mapped_init_1 = initialize_circles(mapped_count);
	
	var mapped_init_2 = initialize_circles(mapped_temp);
	
	// when the input range changes update the circle 
	d3.select("#time_lag").on("input", function() {
	  update(+this.value);
	});
	
	/*
	essai = [{date:40,value:40},{date:180,value:80},{date:300,value:300},{date:40,value:40},
	{date:40,value:40},{date:180,value:80},{date:300,value:300},{date:40,value:40}
	]*/
	
	
	var circles_count= svg.selectAll('circle_count')
	      .data(mapped_init_1)
	      .enter()
	      .append('circle')
	      .attr('cx',function (d) { return d.date })
	      .attr('cy',function (d) { return d.date } )
	      .attr('r','1')
	      .attr('stroke','')
	      .attr('fill','orange')
	
	var circles_temp= svg.selectAll('circle_temp')
	      .data(mapped_init_2)
	      .enter()
	      .append('circle')
	      .attr('cx',function (d) { return d.date })
	      .attr('cy',function (d) { return d.date } )
	      .attr('r','1')
	      .attr('stroke','')
	      .attr('fill','orange')
	
	/*
	essai = [{date:40,value:40},{date:180,value:80},{date:300,value:300}]
	var essai2 = svg.selectAll('essai_2')
	      .data(essai)
	      .enter()
	      .append('circle')
	      .attr('cx',function (d) { return d.date })
	      .attr('cy',function (d) { return d.date } )
	      .attr('r','10')
	      .attr('stroke','')
	      .attr('fill','orange')
	*/

// update the elements
function update(time_lag) {

  // adjust the text on the range slider
  d3.select("#nRadius-value").text(time_lag);
  d3.select("#nRadius").property("value", time_lag);
	
  mapped_count = reduce_left(mapped_count_0,time_lag)
  mapped_count_clean = clean_left(mapped_count_0,time_lag)
  mapped_temp = reduce_right(mapped_temp_0,time_lag)
  mapped_temp_clean = clean_right(mapped_temp_0,time_lag)
  
  count = Object.keys(mapped_count).map(e => parseFloat(mapped_count[e].value));
  temp = Object.keys(mapped_temp).map(e => parseFloat(mapped_temp[e].value));

  console.log('time_lag: ',time_lag)

  
  R = pcorr(count,temp);
  R_mapped = [{'value':Math.round(R*100)/100}]

	
  // update the correlation ccircle radius
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
          .attr('r',4)
          .attr('stroke-width',1)
      })
      .append('title') // Tooltip
      .text('\nSpearson correlation between two variables: ' + Math.round(R*100)/100)
  minDate_1 = get_min_date(mapped_count);
  maxDate_1 = get_max_date(mapped_count);
  
  minDate_2 = get_min_date(mapped_temp);
  maxDate_2 = get_max_date(mapped_temp);
  
  xScale1.domain([minDate_1, maxDate_1])
  xScale2.domain([minDate_2, maxDate_2])
  
  xAxis1.scale(xScale1)
  xAxis2.scale(xScale2)
  
  x_axis_real1.call(xAxis1)
      .append('text') // X-axis Label
      .attr('class','label')
      .attr('y',-20)
      .attr('x',width_s-5)
      .style('text-anchor','end')
      .style("font", "18px times")
      .text('Dates nb new cases')
  	  .style("fill", "blue")
  	  
  x_axis_real2.call(xAxis2)     
  	  .append('text') // X-axis Label
      .attr('class','label')
      .attr('y',-20)
      .attr('x',width_s)
      .style('text-anchor','end')
      .style("font", "18px times")
      .text('Dates weather feature')
  	  .style("fill", "red")
  	  
   path1.datum(mapped_count)
	      .attr("fill", "none")
	      .attr("stroke", "steelblue")
	      .attr("stroke-width", 1.5)
	      .attr("d", d3.line()
	        .x(function(d) { return xScale1(d.date) })
	        .y(function(d) { return yScale1(d.value)  })
	        ) 
	        
   path2.datum(mapped_temp)
	      .attr("fill", "none")
	      .attr("stroke", "red")
	      .attr("stroke-width", 1.5)
	      .attr("d", d3.line()
	        .x(function(d) { return xScale2(d.date) })
	        .y(function(d) { return yScale2(d.value)  })
	        )
		
	circles_count 
      .data(mapped_count_clean)
      .attr('cx', function (d) { return xScale1(d.date) })
      .attr('cy', function (d) { return yScale1(d.value) })
      .attr('r', function (d) { return d.rayon })
      .attr('stroke','blue')
      .attr('fill','blue')
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
          .attr('r',4)
          .attr('stroke-width',1)
      })
      .append('title') // Tooltip
      .text(function (d) { return '\nNew cases: ' + d.value +
                           '\nDate: ' + formatTime(new Date(d.date))})
	
	circles_temp 
      .data(mapped_temp_clean)
      .attr('cx', function (d) { return xScale2(d.date) })
      .attr('cy', function (d) { return yScale2(d.value) })
      .attr('r', function (d) { return d.rayon })
      .attr('stroke','red')
      .attr('fill','red')
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
          .attr('r',7)
          .attr('stroke-width',1)
      })
      .append('title') // Tooltip
      .text(function (d) { return '\nAvg_Temp: ' + d.value +'\ deg. C. '+
                           '\nDate: ' + formatTime(new Date(d.date))}) 
	/*
	essai_new= [{date:150,value:150},{date:300,value:300},{date:100,value:100}]  
	
	console.log(mapped_count)
	console.log(essai_new)
	essai2 
      .data(essai_new)
      .attr('cx', function (d) { return d.date })
      .attr('cy', function (d) { return d.date })
      .attr('r', 80)
      .attr('stroke','red')
      .attr('fill','red')
	
    */
     
      
      /*
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
          .attr('r',4)
          .attr('stroke-width',1)
      })
      .append('title') // Tooltip
      .text(function (d) { return '\nNew cases: ' + d.value +
                           '\nDate: ' + formatTime(new Date(d.date))})
  	  
	*/
	
	 
      /*
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
          .attr('r',4)
          .attr('stroke-width',1)
      })
      .append('title') // Tooltip
      .text(function (d) { return '\nAvg_Temp: ' + d.value +'\ deg. C. '+
                           '\nDate: ' + formatTime(new Date(d.date))}) 

	*/
	
	 
}
    
update(0)

// Initial starting radius of the circle 

});

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

