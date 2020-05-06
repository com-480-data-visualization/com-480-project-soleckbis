

// set the dimensions and margins of the graph
var margin = {top: 10, right:0, bottom: 30, left:0},
    width = 500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

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
	
	
	
let arrX = [2,4,2];
let arrY = [1,2,1];
let R = pcorr(arrX, arrY);
console.log('arrX', arrX, 'arrY', arrY, 'R', R);
	

	var avg_temp = d3.nest()
  	.key(function(d1) {return d1.date; })
  	.rollup(function(v) { return d3.mean(v, function(d1) { return d1.avg_temp}); })
  	.entries(d);
   	
   	var mapped_count = d.map(d => {
  	return {date: new Date(d.date),count: d.count}});
  
  	var mapped_temp = avg_temp.map(d => {
  	return {date: new Date(d.key),temp: d.value}});
  	
  	var count = Object.keys(mapped_count).map(e => mapped_count[e].count);
	var temp = Object.keys(mapped_temp).map(e => mapped_temp[e].count);
	
	var minDate_1 = d3.min(mapped_count, function(d) { return d.date; });
  	var maxDate_1 = d3.max(mapped_count, function(d) { return d.date; });
  
  	var minDate_2 = d3.min(mapped_temp, function(d) { return d.date; });
  	var maxDate_2 = d3.max(mapped_temp, function(d) { return d.date; });
  
  	var minTemp = d3.min(mapped_temp, function(d) { return d.temp; });
  	var maxTemp = d3.max(mapped_temp, function(d) { return d.temp; });
  	
  	var xScale = d3.scaleTime()
    .domain([minDate_1, maxDate_1])
    .range([0,width]);
  
  	var xScale2 = d3.scaleTime()
    .domain([minDate_2, maxDate_2])
    .range([0,width]);
    
    
    var position_x_score = width +100
    
    var xScale3 = d3.scaleTime()
    .domain([0, 0])
    .range([position_x_score,position_x_score]);
  
  	var yScale = d3.scaleLinear()
    .domain([
    	d3.min([0,d3.min(d,function (d) { return d.count })]),
    	d3.max([0,d3.max(d,function (d) { return d.count })])
    	])
    .range([height,0])
  	
  	var yScale2 = d3.scaleLinear().
  	domain([minTemp,maxTemp])
  	.range([height, 0]);
  	
  	var yScale3 = d3.scaleLinear().
  	domain([-1,1])
  	.range([height, 0]);
  	
  	var xAxis = d3.axisBottom()
	  .scale(xScale)
	  .ticks(5)
	  
 	var xAxis2 = d3.axisBottom()
	  .scale(xScale2)
	  .ticks(5)
	 
	 var xAxis3= d3.axisBottom()
	  .scale(xScale3)
	  .ticks(5)
	  
  	// Y-axis
  	var yAxis =  d3.axisLeft()
	  .scale(yScale)
	  .ticks(5)
	  
  	var yAxis2 =  d3.axisLeft()
		.scale(yScale2)
		.ticks(5) 
		
	var yAxis3 =  d3.axisLeft()
		.scale(yScale3)
		.ticks(5) 
		
	
	
   var svgContainer = d3.select("body").append("svg")
                                    .attr("width", 200)
                                     .attr("height", 200);
 
 	//Draw the Circle
 	var circle = svgContainer.append("circle")
                          .attr("cx", 100)
                          .attr("cy", yScale3(R))
                         .attr("r", 20);
   

// X-axis
  svg.append('g')
      .attr('class','axis')
      .attr('transform', 'translate(' + position_x_score + ',0)')
      .call(xAxis3)
      .append('text') // X-axis Label
      .attr('class','label')
      .attr('y',-20)
      .attr('x',width-5)
      .attr('dy','.71em')
      .style('text-anchor','end')
      .text('Dates nb cases')
  	  .style("fill", "blue")

// Y axis correlation
svg.append('g').data(mapped_temp)
      .attr('class', 'axis')  
      .attr('transform','translate(' + position_x_score + ',0)')    
      .call(yAxis3)
      .append('text') // y-axis Label
      .attr('class','label')
      .attr('x',+70)
      .attr('y',-20)
      .attr('dy','.71em')
      .style('text-anchor','end')
      .text('Spearson correlation score')
  	  .style("fill", "black")


// X-axis
  svg.append('g')
      .attr('class','axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis)
      .append('text') // X-axis Label
      .attr('class','label')
      .attr('y',-20)
      .attr('x',width-5)
      .attr('dy','.71em')
      .style('text-anchor','end')
      .text('Dates nb cases')
  	  .style("fill", "blue")
  	  
   svg.append('g')
      .attr('class','axis')
      .attr('transform', 'translate(0,0)')
      .call(xAxis2)
      .append('text') // X-axis Label
      .attr('class','label')
      .attr('y',-20)
      .attr('x',width)
      .attr('dy','.71em')
      .style('text-anchor','end')
      .text('Dates weather feature')
  	  .style("fill", "red")
  
  // Y-axis
  svg.append('g').data(mapped_count)
      .attr('class', 'axis')      
      .call(yAxis)
      .append('text') // y-axis Label
      .attr('class','label')
      .attr('transform','rotate(-90)')
      .attr('x',-10)
      .attr('y',-15)
      .attr('dy','.71em')
      .style('text-anchor','end')
      .text('Nb cases')
  	  .style("fill", "blue")
  	  
  svg.append('g').data(mapped_temp)
      .attr('class', 'axis')  
      .attr('transform','translate('+ width +',0)')    
      .call(yAxis2)
      .append('text') // y-axis Label
      .attr('class','label')
      .attr('transform','rotate(-90)')
      .attr('x',-10)
      .attr('y',+15)
      .attr('dy','.71em')
      .style('text-anchor','end')
      .text('Weather feature')
  	  .style("fill", "red")
       
   console.log(4)
   var formatTime = d3.timeFormat("%B %d, %Y")
   

   var circles = svg.selectAll('circle')
      .data(mapped_count)
      .enter()
      .append('circle')
      .attr('cx',function (d) { return xScale(d.date) })
      .attr('cy',function (d) { return yScale(d.count) })
      .attr('r','4')
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
      .text(function (d) { return '\nNew cases: ' + d.count +
                           '\nDate: ' + formatTime(new Date(d.date))})
                           
                           
     var circles2 = svg.selectAll('circle2')
      .data(mapped_temp)
      .enter()
      .append('circle')
      .attr('cx',function (d) { return xScale2(d.date) })
      .attr('cy',function (d) { return yScale2(d.temp) })
      .attr('r','4')
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
          .attr('r',4)
          .attr('stroke-width',1)
      })
      .append('title') // Tooltip
      .text(function (d) { return '\nAvg_Temp: ' + d.temp +'\ deg. C. '+
                           '\nDate: ' + formatTime(new Date(d.date))})               
  
  
  
   svg.append("path")
      .datum(mapped_count)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return xScale(d.date) })
        .y(function(d) { return yScale(d.count)  })
        ) 
  
  
  svg.append("path")
      .datum(mapped_temp)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return xScale2(d.date) })
        .y(function(d) { return yScale2(d.temp)  })
        ) 
  	
});
