
d3.csv('data/essai.csv', createChart);

function createChart(data) {

	var formatDate = d3.time.format("%Y-%m-%d").parse;
  
   data.forEach(row()=>{
   		
        d.date = formatDate(d.date);
    });
    
    	
  
   var avg_temp = d3.nest()
  	.key(function(d) { return new Date(d.date); })
  	.rollup(function(v) { return d3.mean(v, function(d) { return d.avg_temp; }); })
  	.entries(data);
	console.log(d3.max(avg_temp, function(d) { return d.values; }));
  
  var mapped_count = data.map(d => {
  	return {date: d.date,count: d.count}});
  
  var mapped_temp = avg_temp.map(d => {
  	return {date: new Date(d.key),count: d.values}});

console.log(mapped_count);
console.log(mapped_count.splice(0,2));

console.log(mapped_count);

console.log(mapped_temp);
console.log(mapped_temp.splice(mapped_temp.length-2,mapped_temp.length-1));
console.log(mapped_temp);

var count = Object.keys(mapped_count).map(e => mapped_count[e].count);
var temp = Object.keys(mapped_temp).map(e => mapped_temp[e].count);

var corr = spearson.correlation.spearman(count,temp);

console.log(corr)

  // Variables
  var body = d3.select('body')
	var margin = { top: 150, right: 50, bottom: 50, left: 50 }
	var h = 500 - margin.top - margin.bottom
	var w = 500 - margin.left - margin.right
	var formatPercent = d3.format('.2%')
	// Scales
  
  var colorScale = d3.scale.category20()
  
  var padding = 1;
  
  var minDate_1 = d3.min(mapped_count, function(d) { return d.date; });
  var maxDate_1 = d3.max(mapped_count, function(d) { return d.date; });
  
  var minDate_2 = d3.min(mapped_temp, function(d) { return d.date; });
  var maxDate_2 = d3.max(mapped_temp, function(d) { return d.date; });
  
  var minTemp = d3.min(avg_temp, function(d) { return d.values; });
  var maxTemp = d3.max(avg_temp, function(d) { return d.values; });
  
  var xScale = d3.time.scale()
    .domain([minDate_1, maxDate_1])
    .range([0,w]);
  
  var xScale2 = d3.time.scale()
    .domain([minDate_2, maxDate_2])
    .range([0,w]);
  
  var yScale = d3.scale.linear()
    .domain([
    	d3.min([0,d3.min(data,function (d) { return d.count })]),
    	d3.max([0,d3.max(data,function (d) { return d.count })])
    	])
    .range([h,0])
  var yScale2 = d3.scale.linear().domain([minTemp,maxTemp]).range([h, 0]);
   
	// SVG
  
  var svg = d3.select("#my_dataviz").append('svg')
	    .attr('height',h + margin.top + margin.bottom)
	    .attr('width',w + margin.left + margin.right)
	  .append('g')
	    .attr('transform','translate(' + margin.left + ',' + margin.top + ')')
	// X-axis
  var xAxis = d3.svg.axis()
	  .scale(xScale)
	  .ticks(5)
	  .orient('bottom')
	  
 var xAxis2 = d3.svg.axis()
	  .scale(xScale2)
	  .ticks(5)
	  .orient('bottom')
  // Y-axis
  var yAxis = d3.svg.axis()
	  .scale(yScale)
	  .ticks(5)
	  .orient('left')
	  
  var yAxis2 = d3.svg.axis()
				   .scale(yScale2)
				   .ticks(5)
    			   .orient("right")  
    
  var formatDate = d3.time.format("%d-%m-%Y")
  
  // Circles
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
                           '\nDate: ' + formatDate(new Date(d.date))})
  
 svg.append("path")
      .datum(mapped_count)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.svg.line()
        .x(function(d) { return xScale(d.date) })
        .y(function(d) { return yScale(d.count)  })
        ) 
    
  
  var circles = svg.selectAll('circle2')
      .data(mapped_temp)
      .enter()
      .append('circle')
      .attr('cx',function (d) { return xScale2(d.date); })
      .attr('cy',function (d) { return yScale2(d.count); })
      .attr('r','4')
      .attr('stroke','red')
      .attr('fill','red')
  
  svg.append("path")
      .datum(mapped_temp)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 1.5)
      .attr("d", d3.svg.line()
        .x(function(d) { return xScale2(d.date) })
        .y(function(d) { return yScale2(d.count)  })
        )
        
  // X-axis
  svg.append('g')
      .attr('class','axis')
      .attr('transform', 'translate(0,' + h + ')')
      .call(xAxis)
      .append('text') // X-axis Label
      .attr('class','label')
      .attr('y',-10)
      .attr('x',w)
      .attr('dy','.71em')
      .style('text-anchor','end')
  
    // X-axis high
  svg.append('g')
      .attr('class','axis')
      .attr('transform', 'translate(0,h-10)')
      .call(xAxis2)
      .append('text') // X-axis Label
      .attr('class','label')
      .attr('y',-10)
      .attr('x',w)
      .attr('dy','.71em')
      .style('text-anchor','end')
      
  // Y-axis
  svg.append('g').data(mapped_count)
      .attr('class', 'axis')
      .call(yAxis)
      .append('text') // y-axis Label
      .attr('class','label')
      .attr('transform','rotate(-90)')
      .attr('x',0)
      .attr('y',5)
      .attr('dy','.71em')
      .style('text-anchor','end')
      .text('Nb cases')
  
  // Y-axis right
 
  svg.append('g').data(mapped_temp)
      .attr('class', 'axis')
      .attr('transform',"translate(" + w + " ,0)")
      .call(yAxis2)
      .append('text') // y-axis Label
      .attr('class','label')
      .attr('transform','rotate(-90)')
      .attr('x',0)
      .attr('y',5)
      .attr('dy','.71em')
      .style('text-anchor','end')
      .text('Temp')
      
      
      // Listen to the button -> update if user change it
  d3.select("#nBin").on("input", function() {
    update(+this.value);
  });  
      
}