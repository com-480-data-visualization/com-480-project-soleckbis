
var margin = {top: 0, right:0, bottom: 30, left:100},
	    width = 1500 - margin.left - margin.right,
	    height = 350 - margin.top - margin.bottom;

let  feature = ["Temperature", "Humidity", "Rain", "Wind"],
     times_lag = d3.range(31);

 gridSize = Math.floor(width / times_lag.length),
 height = gridSize * feature.length;

var maingroup = d3.select('#heatmap')
    .append("svg")
    .attr("class", "svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        

var featLabels = maingroup.selectAll(".featLabel")
    .data(feature)
    .enter().append("text")
        .text(function (d) { return d; })
        .attr("x", 0)
        .attr("y", function (d, i) { return i * gridSize; })
        .attr("transform", "translate(-6," + gridSize / 2 + ")")
        .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel axis-workweek" : "dayLabel"); })
        .style("text-anchor", "end");

var timeLabels = maingroup.selectAll(".timeLabel")
    .data(times_lag)
    .enter().append("text")
        .text(function(d) { return d; })
        .attr("x", function(d, i) { return i * gridSize; })
        .attr("y", 0)
        .attr("transform", "translate(" + gridSize / 2 + ", -6)")
        .attr("class", function(d, i) { return ((i >= 9 && i <= 19) ? "timeLabel axis-worktime" : "timeLabel"); })
        .style("text-anchor", "middle");
        

maingroup.append("text")
    .attr("class", "title")
    .attr("x", width / 2)
    .attr("y", -70)
    .style("text-anchor", "middle")
    .text("Heatmap weather correlations");
    
maingroup.append("text")
    .attr("class", "title")
    .attr("x",-83)
    .attr("y", -9)
    .attr("font-weight", 700)
    .style("text-anchor", "middle")
    .style("text-decoration", "underline")
    .text("Time lag (in days): ");
    
d3.csv("data/corrs2.csv").then(function(data) {
    data.forEach(function(d) {
        d.time_lag= +d.time_lag;
        d.temperature = +d.temperature;
        d.humidity= +d.humidity;
        d.rain = +d.rain;
        d.wind= +d.wind;
        
    });
	
var colorScale = d3.scaleLinear()
    .domain([-1,0,1])
    .range(['blue', "white", "red"]);
    

var tooltip = d3.select("#heatmap")
    .append("div")
 
var mouseover = function(d) {
    tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }

var mouseleave = function(d) {
    tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.8)
  }


var heatMap = maingroup.selectAll(".hour")
    .data(data)
    .enter().append("rect")
        .attr("x", function(d) { return d.time_lag * gridSize; })
        .attr("y", function(d) { return 0* gridSize; })
        .attr("width", gridSize)
        .attr("height", gridSize)
        .style("stroke", "white")
        .style("stroke-opacity", 0.2)
        .style("fill", function(d) { return colorScale(d.temperature ); })
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on('mouseover', mouseover )
        .on('mouseout',mouseleave)
        .append('title') 
        .text(function (d) { return '\n'+'Pearson correlation : ' + Math.round(d.temperature*1000)/1000})

 
var heatMap = maingroup.selectAll(".hour")
    .data(data)
    .enter().append("rect")
        .attr("x", function(d) { return d.time_lag * gridSize; })
        .attr("y", function(d) { return 1* gridSize; })
        .attr("width", gridSize)
        .attr("height", gridSize)
        .style("stroke", "white")
        .style("stroke-opacity", 0.2)
        .style("fill", function(d) { return colorScale(d.humidity ); })
		.style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on('mouseover', mouseover)
        .on('mouseout',mouseleave)
        .append('title') 
        .text(function (d) { return '\n'+'Pearson correlation : ' + Math.round(d.humidity*1000)/1000})
     
    
var heatMap = maingroup.selectAll(".hour")
    .data(data)
    .enter().append("rect")
        .attr("x", function(d) { return d.time_lag * gridSize; })
        .attr("y", function(d) { return 2* gridSize; })
        .attr("width", gridSize)
        .attr("height", gridSize)
        .style("stroke", "white")
        .style("stroke-opacity", 0.2)
        .style("fill", function(d) { return colorScale(d.rain ); })
		.style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on('mouseover', mouseover )
        .on('mouseout',mouseleave)
        .append('title')
        .text(function (d) { return '\n'+'Pearson correlation : ' + Math.round(d.rain*1000)/1000})
     
    
var heatMap = maingroup.selectAll(".hour")
    .data(data)
    .enter().append("rect")
        .attr("x", function(d) { return d.time_lag * gridSize; })
        .attr("y", function(d) { return 3* gridSize; })
        .attr("width", gridSize)
        .attr("height", gridSize)
        .style("stroke", "white")
        .style("stroke-opacity", 0.2)
        .style("fill", function(d) { return colorScale(d.wind); })
		.style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on('mouseover', mouseover )
        .on('mouseout',mouseleave)
        .append('title')
        .text(function (d) { return '\n'+'Pearson correlation : ' + Math.round(d.wind*1000)/1000})
     
numStops = 5;
countPoint = [-1,-0.5, 0, 0.5,1];


var countScale = d3.scaleLinear()
    .domain([-1, 1])
    .range([0, width])

maingroup.append("defs")
    .append("linearGradient")
    .attr("id", "legend-traffic")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "0%")
    .selectAll("stop") 
    .data(d3.range(numStops))                
    .enter().append("stop") 
        .attr("offset", function(d,i) { 
            return countScale(countPoint[i]) / width;
        })   
        .attr("stop-color", function(d,i) { 
            return colorScale(countPoint[i]); 
        });

var legendWidth = Math.min(width * 0.8, 400);
        
var legendsvg = maingroup.append("g") // groupe principal
    .attr("class", "legendWrapper")
    .attr("transform", "translate(" + (width/2) + "," + (gridSize * feature.length + 40) + ")");

legendsvg.append("text") // légende
    .attr("class", "legendTitle")
    .attr("x", 0)
    .attr("y", -10)
    .style("text-anchor", "middle")
    .text("Correlation Scale");

legendsvg.append("rect") // rectangle avec gradient
    .attr("class", "legendRect")
    .attr("x", -legendWidth/2)
    .attr("y", 0)
    .attr("width", legendWidth)
    .attr("height", 10)
    .style("fill", "url(#legend-traffic)");
    
var xScale = d3.scaleLinear() // scale pour x-axis
     .range([-legendWidth / 2, legendWidth / 2])
     .domain([-1,1])
		
legendsvg.append("g") // x axis
    .attr("class", "axis")
    .attr("transform", "translate(0," + (10) + ")")
    .call(d3.axisBottom(xScale).ticks(8));

});



