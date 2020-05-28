
class MapPlot {
	
	// The color axis representing the color corresponding to the concentration
	makeColorbar(svg, color_scale, top_left, colorbar_size, scaleClass=d3.scaleLinear) {
		
		// The axis numbers
		const yScale = [0, 4, 8, 10, 20, 40, 80, 100, 800, 1000, 4000, 8000];

		const value_to_svg = scaleClass()
			.domain(yScale)
			.range([colorbar_size[1], 0.9*colorbar_size[1], 0.81*colorbar_size[1], 0.72*colorbar_size[1], 0.63*colorbar_size[1], 0.54*colorbar_size[1], 0.45*colorbar_size[1], 0.36*colorbar_size[1], 0.27*colorbar_size[1], 0.18*colorbar_size[1], 0.09*colorbar_size[1], 0]);
		
		const range01_to_color = d3.scaleLinear()
			.domain([0, 0.09, 0.18, 0.27, 0.36, 0.45, 0.54, 0.63, 0.72, 0.81, 0.9, 1])
			.range(color_scale.range())
			.interpolate(color_scale.interpolate());
			
		// Axis legend	
		this.svg.append("text").text("Cases per million of inhabitants").attr("transform", "translate(150,-480)");

		const colorbar_axis = d3.axisLeft(value_to_svg).tickValues(yScale);
		
		// Add the colorbar
		const colorbar_g = this.svg.append("g")
			.attr("id", "colorbar")
			.attr("transform", "translate(" + top_left[0] + ', ' + top_left[1] + ")")
			.call(colorbar_axis);

		// Create the gradient
		function range01(steps) {
			return Array.from(Array(steps), (elem, index) => index / (steps-1));
		}

		const svg_defs = this.svg.append("defs");

		const gradient1 = svg_defs.append('linearGradient')
			.attr('id', 'colorbar-gradient1')
			.attr('x1', '0%') // bottom
			.attr('y1', '100%')
			.attr('x2', '0%') // to top
			.attr('y2', '0%')
			.attr('spreadMethod', 'pad');

		gradient1.selectAll('stop')
			.data(range01(10))
			.enter()
			.append('stop')
				.attr('offset', d => Math.round(100*d) + '%')
				.attr('stop-color', d => range01_to_color(d))
				.attr('stop-opacity', 1);

		// create the colorful rect
		colorbar_g.append('rect')
			.attr('id', 'colorbar-area')
			.attr('width', colorbar_size[0])
			.attr('height', colorbar_size[1])
			.style('fill', 'url(#colorbar-gradient1)')
			.style('stroke', 'black')
			.style('stroke-width', '1px')
	}
	
	makeSlider(svg, time_value, svg_element_id, Type, projection, path_generator, color_scale) {
		
		var timer;
		
		const $this = this;
		
		var currentValue = 0;
		
		var playButton = d3.select("#PlayButton1");
		var pauseButton = d3.select("#PauseButton1");
		var restartButton = d3.select("#RestartButton1");
		var speedButton = d3.select("#SpeedButton1");
		var genderButton = d3.select("#Gender1");
		var ageButton = d3.select("#Age1");
		var radiobuttons = d3.select(".bar_radio").selectAll("input")
		
		document.getElementById("AgeRadioButton").click()
		var BarType = "Age";
		
		// When click on button filtering gender update map and fatality rate automatically
		genderButton.on("change", function(d) {
			updateMap(time_value.invert(currentValue), this.value, ageButton.node().value);
			updateFatality(time_value.invert(currentValue), this.value, ageButton.node().value);
		})
		
		// When click on button filtering age update map and fatality rate automatically
		ageButton.on("change", function(d) {
			updateMap(time_value.invert(currentValue), genderButton.node().value, this.value);
			updateFatality(time_value.invert(currentValue), genderButton.node().value, this.value);
		})
		
		// When click on radios button for the bar plot type update the bar plot automatically
		radiobuttons.on("change", function(d) {
			d3.select("#barsvg").selectAll("*").remove()
			BarType = this.value;
			updateBar(time_value.invert(currentValue), BarType, true);
		})
		
		var formatDate = d3.timeFormat("%d %B %Y");
		var formatDateintoMonth = d3.timeFormat("%B");
		var formatDateString = d3.timeFormat("%Y-%m-%d");
		
		var targetValue = time_value.range()[1];
		
		var disease_promise;
		var map_promise;
		
		// Create the maps at the beginning
		updateEvent(time_value.domain()[0]);
		updateMap(time_value.domain()[0], genderButton.node().value, ageButton.node().value, true);
		updateBar(time_value.domain()[0], BarType, true);
		updateFatality(time_value.domain()[0], genderButton.node().value, ageButton.node().value);
		d3.select('#provinces_text').style("opacity", 0);
		
		// Step for advancing the time slider
		function step() {
			update(time_value.invert(currentValue));
			currentValue = currentValue + (targetValue/100);
			if (currentValue > targetValue) {
				clearInterval(timer);
			}
		}
		
		// update the map and barplot at each time step
		function update(h) {
			handle.attr("cx", time_value(h));
			label.attr("x", time_value(h))
			.text(formatDate(h))
			genderButton = d3.select("#Gender1");
			ageButton = d3.select("#Age1");
			updateEvent(h);
			updateMap(h, genderButton.node().value, ageButton.node().value);
			updateBar(h, BarType);
			updateFatality(h, genderButton.node().value, ageButton.node().value);
		}
		
		// The time slider
		var slider = this.svg.append("g")
			.attr("class", "slider")
			.attr("transform", "translate(170,-600)");
		
		slider.transition().duration(350);	
		
		// Style the slider and drapgging possibility
		slider.append("line")
			.attr("class","track")
			.attr("x1", time_value.range()[0])
			.attr("x2", time_value.range()[1])
			.select(function() { return this.parentNode.appendChild(this.cloneNode(true));})
				.attr("class", "track-inset")
			.select(function() {return this.parentNode.appendChild(this.cloneNode(true));})
				.attr("class", "track-overlay")
				.call(d3.drag()
					.on("start.interrupt", function(){slider.interrupt(); })
					.on("start drag", function(){
						currentValue = d3.event.x;
						update(time_value.invert(currentValue));
					})
				);
		
		slider.insert("g", ".track-overlay")
			.attr("class", "ticks")
			.attr("transform", "translate(0,10)")
		.selectAll("text")
			.data(time_value.ticks(5))
			.enter()
			.append("text")
			.attr("x", time_value)
			.attr("y", 10)
			.attr("text-anchor", "middle")
			.text(function(d) {return formatDateintoMonth(d);});
				
		var handle = slider.insert("circle", ".track-overlay")
			.attr("class", "handle")
			.attr("r", 9);
		
		// Give the date
		var label = slider.append("text")
			.attr("class", "label")
			.attr("text-anchor", "middle")
			.text(formatDate(time_value.domain()[0]))
			.attr("transform", "translate(0, -25)")
		
		// Play button activate running of time slider
		playButton.on("click", function() {
			timer = setInterval(step, 300);
		});
		
		// Pause button
		pauseButton.on("click", function() {
			clearInterval(timer);
		});
		
		// Restart button
		restartButton.on("click", function() {
			currentValue = 0;
			update(time_value.invert(currentValue));
			clearInterval(timer);
		});
		
		// Speed 3 times the time slider
		speedButton.on("click", function(d) {
			timer = setInterval(step, 100);
		})
		
		// Mouse over on regions of South Korea
		function handleMouseOver(d, i) {
			d3.select(this).style('opacity', 0.9)
				.style('stroke-width', 1)
			d3.select('#provinces_text')
				.transition()    
            		.duration(200)
				.style("opacity", 1)
			if (Type=="provinces") {
				d3.select('#provinces_text')
					.html(d.properties.NAME_1+"<br>"+' Total cases : '+d.properties.total_cases)
					.style("left", (d3.event.pageX) + "px")		
                		.style("top", (d3.event.pageY - 28) + "px");
			} else if (Type == 'municipalities') {
				d3.select('#provinces_text')
					.html(d.properties.NAME_2+"<br>"+' Total cases : '+d.properties.total_cases)
					.style("left", (d3.event.pageX) + "px")		
                		.style("top", (d3.event.pageY - 28) + "px");
			}
		}
		
		// Stop mouseover event when the mouse is out the regions
		function handleMouseOut(d, i) {
			d3.selectAll('.province').style('opacity', 0.8)
			.style('stroke-width', 0.2)
			d3.select('#provinces_text').style("opacity", 0);
		}
		
		// Test is the object is empty to forward fill the special events
		function isnotEmpty(obj) {
    			for(var key in obj) {
        		if(obj.hasOwnProperty(key))
            		return true;
    			}
    			return false;
		}
		
		// Change the special event depending on the date
		function updateEvent(date) {
			var event_promise = d3.csv("data/Policy.csv").then((data)=>{
				let event_policy = {};
				var filter_data = data.filter(function (a){return a.date==formatDateString(date)});
				filter_data.forEach((row)=> {
					event_policy = row.policy;
				})
				return event_policy;
			});
			Promise.all([event_promise]).then((results)=>{
				let event = results[0];
				if (isnotEmpty(event)) {
					d3.select(".Event1").selectAll("*").remove();
					d3.select(".Event1").append("b")
					.append("text")
					.text(event);
				}
			});
		}

		// update map depending on gender, age, date and type for each time step or button click
		function updateMap(date, gender, age, new_map=false) {
			
			// Fetch the data
			if (Type=='provinces') {
				disease_promise = d3.csv("data/"+gender+"_"+age+".csv").then((data)=>{
					let province_concentration = {};
					var filter_data = data.filter(function (a){return a.date==formatDateString(date)});
					filter_data.forEach((row)=> {
						province_concentration[row.province] = [parseFloat(row.proportion_province),parseFloat(row.total_province_cases)];
					});
					return province_concentration;
				});
			
				map_promise = d3.json('json/skorea-provinces-topo.json').then((topojson_raw)=> {
					const province_paths = topojson.feature(topojson_raw,  topojson_raw.objects.provinces);
					return province_paths.features;
				});
			} else if (Type=='municipalities') {
				disease_promise = d3.csv("data/"+gender+"_"+age+".csv").then((data)=>{
					let province_concentration = {};
					var filter_data = data.filter(function (a){return a.date==formatDateString(date)});
					filter_data.forEach((row)=> {
						province_concentration[row.city] = [parseFloat(row.proportion_city),parseFloat(row.total_city_cases)];
					});
					return province_concentration;
				});
			
				map_promise = d3.json('json/skorea-municipalities-topo.json').then((topojson_raw)=> {
					const province_paths = topojson.feature(topojson_raw,  topojson_raw.objects.municipalities);
					return province_paths.features;
				});
			}
		
			Promise.all([map_promise, disease_promise]).then((results)=> {
				let map_data = results[0];
				let province_disease = results[1];
				
				var zoominButton = d3.select("#ZoomIn1");
				var zoomoutButton = d3.select("#ZoomOut1");
			
				map_data.forEach(province => {
					if (Type=="provinces") {
						try {
							province.properties.density = province_disease[province.properties.NAME_1][0];
							province.properties.total_cases = province_disease[province.properties.NAME_1][1];
						} catch (error) {
							province.properties.density = 0
							province.properties.total_cases = 0
						}
					} else if (Type="municipalities") {
						try {
							province.properties.density = province_disease[province.properties.NAME_2][0];
							province.properties.total_cases = province_disease[province.properties.NAME_2][1];
						} catch (error) {
							province.properties.density = 0
							province.properties.total_cases = 0
						}
					}
				})
				
				var map_container;
				
				if (new_map==true) {
					map_container = svg.append('g').attr("class", "Map").attr("transform", "translate(150,-480)");
				} else {
					map_container = d3.select('#concentration').select(".Map");
				}
				
				// Call zoom for the map
				const zoom = d3.zoom()
					.on('zoom', zoomed);
				
				zoominButton.on("click", function() {
					zoom.scaleBy(svg.transition().duration(750), 1.2)
				});
				zoomoutButton.on("click", function() {
					zoom.scaleBy(svg.transition().duration(750), 0.8)
				});
				
				// Color the provinces depending on the concentration of cases
				if (new_map==true) {
					map_container.selectAll(".province")
						.data(map_data)
						.enter()
						.append("path")
						.classed("province", true)
						.attr("d", path_generator)
						.style("fill", (d)=> color_scale(d.properties.density))
						.style("stroke", "rgb(25,25,25)")
						.style("stroke-width", 0.2)
						.on("mouseover", handleMouseOver)
						.on("mouseout", handleMouseOut);
				} else {
					map_container.selectAll(".province")
						.data(map_data)
						.style("fill", (d)=> color_scale(d.properties.density))
						.style("stroke", "rgb(25,25,25)")
						.style("stroke-width", 0.2)
						.on("click", handleMouseOver);
				}
				
				// Remove zooming from clicking or mouse wheel
				svg.call(zoom).on("dblclick.zoom", null)
						.on("wheel.zoom", null);
				
				function zoomed() {
					map_container.selectAll('path')
					.attr('transform', d3.event.transform);
				}

				// Create the color axis
				if (new_map==true) {
					$this.makeColorbar(svg, color_scale, [250, -450], [20, $this.svg_height - 2*30]);
				};
			})
		}
		
		// Display informations about one specific bar when hover
		function BarOver(d, i, BarType) {
			d3.select(this).style('opacity', 0.9)
				.style('stroke-width', 1)
			d3.select("#provinces_text")
				.transition()
				.duration(300)
				.style("opacity", 1);
			if(BarType=="Age") {
				d3.select("#provinces_text")
					.style("opacity", 1)
					.style("left", (d3.event.pageX) + "px")		
                		.style("top", (d3.event.pageY - 28) + "px")
                		.html(d.data.age+"<br>"+"Confirmed: "+d.data.confirmed+"<br>"+"Deceased: "+d.data.deceased+"<br>"+"Fatality rate: "+(100*(d.data.deceased/d.data.confirmed)).toFixed(2)+"%");
			} else if (BarType=="Gender") {
				d3.select("#provinces_text")
					.style("opacity", 1)
					.style("left", (d3.event.pageX) + "px")		
                		.style("top", (d3.event.pageY - 28) + "px")
                		.html(d.data.sex+"\n"+"Confirmed: "+d.data.confirmed+"\n"+"Deceased: "+d.data.deceased+"\n"+"Fatality rate: "+(100*(d.data.deceased/d.data.confirmed)).toFixed(2)+"%");
            } else if (BarType=="Province") {
           		d3.select("#provinces_text")
					.style("opacity", 1)
					.style("left", (d3.event.pageX) + "px")		
                		.style("top", (d3.event.pageY - 28) + "px")
                		.html(d.data.province+"\n"+"Confirmed: "+d.data.confirmed+"\n"+"Deceased: "+d.data.deceased+"\n"+"Fatality rate: "+(100*(d.data.deceased/d.data.confirmed)).toFixed(2)+"%");
            } 
         }
         
         function BarOut() {
         	d3.select("#provinces_text").style("opacity", 0);
         }
         
         // Create an array with a single value repeated multiple times
         function fillArray(value, len) {
  			if (len == 0) return [];
  			var a = [value];
  			while (a.length * 2 <= len) a = a.concat(a);
  			if (a.length < len) a = a.concat(a.slice(0, len - a.length));
  			return a;
		}
		
		// Update the bar for each time step or button click
		function updateBar (date, BarType, new_map = false) {
			var bar_promise = d3.csv("data/Time"+BarType+".csv").then((data)=> {
				
				var filter_data = data.filter(function(a){return a.date==formatDateString(date)});
				var subgroups = data.columns.slice(3);
				var groups;
				
				if (BarType=="Age") {
					groups = d3.map(data, function(d){return d.age}).keys();
				} else if (BarType=="Gender") {
					groups = d3.map(data, function(d){return d.sex}).keys();
				} else if (BarType=="Province") {
					groups = d3.map(data, function(d){return d.province}).keys();
				}
				
				// Create stacked bar plot
    				var stackedData = d3.stack().keys(subgroups)(filter_data);
    				
				
				var bar_container;
				var width;
				
				// Change the size of bar plot depending on the type
				if (BarType=="Age") {
					width = 450;
				} else if (BarType=="Gender") {
					width = 250;
				} else if (BarType=="Province") {
					width = 850;
				}
				
				var height = 300;
				var heighty = height-600;
				var maxdomain;
				
				if (BarType=="Age") {
					maxdomain = 3000;
				} else {
					maxdomain = 7000;
				}
				
				var svg2 = d3.select("#barsvg");
				
				var x = d3.scaleBand()
					.domain(groups)
    					.range([0, width])
    					.padding(0.2);
    				
    				if (BarType != "Province") {
    					svg2.append("g")
    						.attr("transform", "translate(400,"+heighty+")")
    						.call(d3.axisBottom(x).tickSizeOuter(0));
    				} else if (BarType == "Province") {
    					var ticksclick = fillArray("click", 17);
    					svg2.append("g")
    						.attr("transform", "translate(400,"+heighty+")")
    						.call(d3.axisBottom(x).tickFormat(function(d, i) {
    							return ticksclick[i];
  						}))
  						d3.selectAll(".tick")
    							.on("click", function(d,i){
    								console.log(i);
    								console.log(stackedData[0][i-12])
								BarOver(stackedData[0][i-12],i,BarType);
							});
    				}
    				
    				
    				var y = d3.scaleLinear()
    					.domain([0,maxdomain])
    					.range([height, 0]);
    					
    				svg2.append("g")
    					.attr("transform", "translate(400,-600)")
    					.call(d3.axisLeft(y));
    				
    				// Color of confirmed and deceased	
    				var color_range = [ "#0084d3", '#864b97', ]
    				
    				var color = d3.scaleOrdinal()
    					.domain(subgroups)
    					.range(color_range);

				
				if (new_map==true) {
					bar_container = svg2.append("g").attr("class", "Bar");
				} else {
					d3.select("#barsvg").select(".Bar").selectAll("*").remove();
					bar_container = d3.select("#barsvg").select(".Bar");
				}
				
				// append the bars
				bar_container.append("g").selectAll("g")
					.data(stackedData)
					.enter()
					.append("g")
						.attr("fill", function(d) {return color(d.key)})
						.selectAll("rect")
						.data(function(d){return d})
						.enter().append("rect")
							.attr("x", function (d) {
								if (BarType=="Age") {
									return x(d.data.age);
								} else if (BarType=="Gender") {
									return x(d.data.sex);
								} else if (BarType=="Province") {
									return x(d.data.province);
								}
							})
							.attr("y", function (d) {return y(d[1])})
							.attr("transform", "translate(400,-600)")
							.attr("height", function (d) {return y(d[0])-y(d[1])})
							.attr("width", x.bandwidth())
							.on("click", function(d,i){
								BarOver(d,i,BarType);
							})
							.on("mouseout", function(d,i){
								BarOut(d,i,BarType);
							});
				
				bar_container.append("text").text("Total Cases")
					.attr("transform", "translate(360,-620)")
					.style("font-size", "15px");
				
				// Add the color legend
				bar_container.append("g")
					.attr("class", "legend")
					.selectAll("rect")
						.data(color_range)
						.enter()
						.append("rect")
							.attr("x", width-18)
							.attr("width", 18)
							.attr("height", 18)
							.attr("transform", function(d, i){
								var offset = -630 + 19*i;
								return "translate(300,"+offset+")"})
							.style("fill", function(d, i){return color_range.slice()[i]})
							
				bar_container.select(".legend").selectAll("text")
					.data(["Confirmed", "Deceased"])
					.enter()
					.append("text")
						.text(function(d) {return d})
						.attr("x", width-18)
						.attr("transform", function(d, i){
								var offset = -615 + 19*i;
								return "translate(330,"+offset+")"})
						.style("font-size", "15px");
									
			})
		}
		
		// Update the fatality rate from time step or button click
		function updateFatality(date, gender, age) {
			d3.csv("data/TimeGenderAge.csv").then((data)=> {
				var filter_data = data.filter(function(a){return (a.date == formatDateString(date))});
				var filter_data2;
				
				if ((gender=="All")&(age=="All")) {
					filter_data2 = filter_data.slice();
				} else if ((gender=="All")&(age!="All")) {
					filter_data2 = filter_data.filter(function(a){return a.age==age});
				} else if ((gender!="All")&(age=="All")){
					filter_data2 = filter_data.filter(function(a){return a.sex==gender});
				} else {
					filter_data2 = filter_data.filter(function(a){return (a.sex==gender)&(a.age==age)});
				}
				
				if (!(Array.isArray(filter_data) && filter_data.length)) {
					d3.select(".Fatality1")
						.html("Population Fatality Rate : 0% Group Fatality Rate : 0%");
				} else if (!(Array.isArray(filter_data2) && filter_data2.length)) {
					d3.select(".Fatality1")
						.html("Population Fatality Rate : "+(100*(d3.sum(filter_data,d=>d.deceased)/d3.sum(filter_data, d=>d.confirmed))).toFixed(2)+"% "+ "Group Fatality Rate : 0%");
				} else {
					d3.select(".Fatality1")
						.html("Population Fatality Rate : "+(100*(d3.sum(filter_data,d=>d.deceased)/d3.sum(filter_data, d=>d.confirmed))).toFixed(2)+"% "+ "Group Fatality Rate : " + (100*(d3.sum(filter_data2,d=>d.deceased)/d3.sum(filter_data2, d=>d.confirmed))).toFixed(2)+"%");
				}

			})
		}
	};
	
	constructor(svg_element_id, Type){
		this.svg = d3.select('#' + svg_element_id);
		const svg_viewbox = this.svg.node().viewBox.animVal;
		this.svg_width = svg_viewbox.width;
		this.svg_height = svg_viewbox.height;
		
		var targetValue = 700;
		
		// create the time range
		var time_promise = d3.csv("data/All_All.csv").then((data) => {
			var time_value = d3.scaleTime()
			.domain(d3.extent(data, function(d){return new Date(d.date);}))
			.range([0, targetValue])
			.clamp(true);
			return time_value;
		})
		
		// Map projection
		const projection = d3.geoNaturalEarth1()
			.rotate([0,0])
			.center([128, 36])
			.scale(5000)
			.translate([this.svg_width, this.svg_height/2])
			.precision(0.1);
			
		const path_generator = d3.geoPath()
			.projection(projection);
		
		// Color pallette for the concentration
		const color_scale = d3.scaleLinear()
			.domain([0, 4e-6, 8e-6, 1e-5, 4e-5, 8e-5, 1e-4, 4e-4, 8e-4, 1e-3, 4e-3, 8e-3])
			.range(['#b6e200', '#e2c84b', '#e7b94c', '#e9aa4b', '#ea9b49', '#ea8c47', '#ea7d44', '#e86c41', '#e65b3d', '#e4483a', '#e13036', '#dd0032'])
			.interpolate(d3.interpolateHcl);
		
		
		Promise.all([time_promise]).then((results)=> {
			let time_value = results[0];
			this.makeSlider(this.svg, time_value, svg_element_id, Type, projection, path_generator, color_scale);
		})
		
		
	}	
}

// Make notes indicating the provinces and municipalities specificities of South Korea
class MakeNotes {
	constructor(Type) {
		this.Type = Type;
		
		if (this.Type==="provinces") {
			d3.select(".Notes1").selectAll("*").remove();
			d3.select(".Notes1").append("text").text("Note: The provinces correspond to the 6 metropolitain cities,"+"\n"+"a special city (Seoul), a special autonomous city (Sejong) and the 9 provinces.");
		}
		else if (this.Type=="municipalities") {
			d3.select(".Notes1").selectAll("*").remove();
			d3.select(".Notes1").append("text").text("Note: The municipalities correspond to the cities, counties" +"\n"+ "and districts of South Korea.")
		}
	}
}

function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

whenDocumentLoaded(() => {
	// Clicking Provinces or Municipalities will change the map type and restart the time slider at the beginning
	document.getElementById("provinces1").click();
	text = new MakeNotes("provinces");
	const radios = document.getElementsByName("MapType1");
	var Type = 'provinces';
	plot_object = new MapPlot('concentration', Type);
	for (var i = 0, max=radios.length; i<max; i++) {
		radios[i].onclick = function () {
			d3.select('#concentration').selectAll("*").remove();
			Type = this.value;
			text = new MakeNotes(Type);
			plot_object = new MapPlot('concentration', Type);
		}
	}
	// plot object is global, you can inspect it in the dev-console
});

