
class MapCircle {
	
	// Make the axis with the circles
	makeCirclebar(svg, circle_scale, top_left, circlebar_size, scaleClass=d3.scaleLinear) {
		
		// Make cirle of 1, 10, 100 and 1000 cases respectively
		const value_to_svg = d3.scalePoint()
			.domain([1, 10, 100, 1000])
			.range([circlebar_size[1], 0]);
		
		const range01_to_radius = d3.scaleLinear()
			.domain([0, 1000])
			.range([0, 500]);

		// Axis numbers
		const circlebar_axis = d3.axisLeft(value_to_svg)
			.tickFormat(d3.format(".0f"))
		
		const circlebar_g = this.svg.append("g")
			.attr("id", "circlebar")
			.attr("transform", "translate(" + top_left[0] + ', ' + top_left[1] + ")")
			.call(circlebar_axis)
			.selectAll('.tick')
				.append("circle")
				.attr('r', (d)=>Math.sqrt(range01_to_radius(d)))
				.attr("cx", 50)
				.style("fill", "red");	
		
		// Awis Label		
		this.svg.append("text").text("Total daily cases").attr("transform", "translate(200,-340)");
		}
		
		
	makeSlider(svg, time_value, svg_element_id, Type, projection, path_generator, radius_scale) {
		
		var timer;
		
		const $this = this;
		
		var currentValue = 0;
		
		var playButton = d3.select("#PlayButton2");
		var pauseButton = d3.select("#PauseButton2");
		var restartButton = d3.select("#RestartButton2");
		var speedButton = d3.select("SpeedButton2");
		var genderButton = d3.select("#Gender2");
		var ageButton = d3.select("#Age2");
		
		var formatDate = d3.timeFormat("%d %B %Y");
		var formatDateintoMonth = d3.timeFormat("%B");
		var formatDateString = d3.timeFormat("%Y-%m-%d");
		
		var targetValue = time_value.range()[1];
		
		var disease_promise;
		var map_promise;
		
		var displayButton = d3.select("#display");
		
		// Update the map and causes automatically when clicking the button filtering gender
		genderButton.on("change", function(d) {
			updateMap(time_value.invert(currentValue), this.value, ageButton.node().value);
			updateCauses(time_value.invert(currentValue), this.value, ageButton.node().value);
		});
		
		// Update the map and causes automatically when clicking the button filtering age
		ageButton.on("change", function(d) {
			updateMap(time_value.invert(currentValue), genderButton.node().value, this.value);
			updateCauses(time_value.invert(currentValue), genderButton.node().value, this.value);
		})
		
		// Change the number of causes automatically when clicking
		displayButton.on("change", function(d) {
			updateCauses(time_value.invert(currentValue), genderButton.node().value, ageButton.node().value);
		})
		
		// Initialize the map, event and causes
		updateEvent(time_value.domain()[0]);
		updateMap(time_value.domain()[0], genderButton.node().value, ageButton.node().value, true);
		updateCauses(time_value.domain()[0], genderButton.node().value, ageButton.node().value, true);
		
		// Give information about the region when mouseover
		function handleMouseOver(d, i) {
			d3.select(this).style('opacity', 0.9)
				.style('stroke-width', 1)
			d3.select('#provinces_text')
				.transition()    
            		.duration(200)
				.style("opacity", 1)
			if (Type=="provinces") {
				d3.select('#provinces_text')
					.style("visibility", "visible")
					.html(d.properties.NAME_1+"<br>"+' Total cases : '+d.properties.cases)
					.style("left", (d3.event.pageX) + "px")		
                		.style("top", (d3.event.pageY - 28) + "px");
			} else if (Type == 'municipalities') {
				d3.select('#provinces_text')
					.html(d.properties.NAME_2+"<br>"+' Total cases : '+d.properties.cases)
					.style("left", (d3.event.pageX) + "px")		
                		.style("top", (d3.event.pageY - 28) + "px");
			}
		}

		// Stop showing the information when the mouse is out the region
		function handleMouseOut(d, i) {
			d3.selectAll('.province').style('stroke-width', 0.2);
			d3.select('#provinces_text').style("opacity", 0);
		}
			
		// Advance the time slider of one step
		function step() {
			update(time_value.invert(currentValue));
			currentValue = currentValue + (targetValue/100);
			if (currentValue > targetValue) {
				clearInterval(timer);
			}
		}
		
		// Update the event, map and causes at each time step
		function update(h) {
			handle.attr("cx", time_value(h));
			label.attr("x", time_value(h))
			.text(formatDate(h));
			genderButton = d3.select("#Gender2");
			ageButton = d3.select("#Age2");
			updateEvent(h);
			updateMap(h, genderButton.node().value, ageButton.node().value);
			updateCauses(h, genderButton.node().value, ageButton.node().value);
		}
		
		// The time slider	
		var slider = this.svg.append("g")
			.attr("class", "slider")
			.attr("transform", "translate(170,-450)");	
		
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
			
		// Give the actual time
		var label = slider.append("text")
			.attr("class", "label")
			.attr("text-anchor", "middle")
			.text(formatDate(time_value.domain()[0]))
			.attr("transform", "translate(0, -25)")
		
		// Button that play the time slider
		playButton.on("click", function() {
			timer = setInterval(step, 300);
		});
		
		// Pause the time slider
		pauseButton.on("click", function() {
			clearInterval(timer);
		});
		
		// Restart the time
		restartButton.on("click", function() {
			currentValue = 0;
			update(time_value.invert(currentValue));
			clearInterval(timer);
		});
		
		// Speed 3 times the time slider
		speedButton.on("click", function(d) {
			timer = setInterval(step, 100);
		})
		
		// Function to test if an objet is empty first used to fill forward the date events
		function isnotEmpty(obj) {
    			for(var key in obj) {
        		if(obj.hasOwnProperty(key))
            		return true;
    			}
    			return false;
		}
		
		// Update the special event when playing or dragging the time slider
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
					d3.select(".Event2").selectAll("*").remove();
					d3.select(".Event2").append("b")
					.append("text")
					.text(event);
				}
			});
		}
		
		// Update the map when filtering the group, playing or dragging the time slider
		function updateMap(date, gender, age, new_map=false) {
			
			if (Type=='provinces') {
				disease_promise = d3.csv("data/"+gender+"_"+age+".csv").then((data)=>{
					let province_concentration = {};
					var filter_data = data.filter(function (a){return a.date==formatDateString(date)});
					filter_data.forEach((row)=> {
						province_concentration[row.province] = [parseFloat(row.province_cases)];
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
						province_concentration[row.city] = [parseFloat(row.city_cases)];
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
			
				map_data.forEach(province => {
					if (Type=="provinces") {
						try {
							province.properties.cases = province_disease[province.properties.NAME_1][0];						
						} catch (error) {
							province.properties.cases = 0
						}
					} else if (Type="municipalities") {
						try {
							province.properties.cases = province_disease[province.properties.NAME_2][0];
						} catch (error) {
							province.properties.cases = 0
						}
					}
				})
			
			radius_scale.domain([0, 1000]);
			
			var map_container;
			var circle_container;
			
			if (new_map==true) {
				map_container = svg.append('g').attr("class", "Map").attr("transform", "translate(150,-150)");
				circle_container = svg.append('g').attr("class", "Circle");
			} else {
				map_container = d3.select('#circles').select(".Map");
				circle_container = d3.select("#circles").select(".Circle");
			}

			
			// Create the map with provinces or municipalities
			if (new_map==true) {
				map_container.selectAll(".province")
					.data(map_data)
					.enter()
					.append("path")
					.classed("province", true)
					.attr("d", path_generator)
					.style("stroke", "rgb(25,25,25)")
					.style("stroke-width", 0.2)
					.style("fill", "white")
					.on('mouseover', handleMouseOver)
					.on('mouseout', handleMouseOut);
			} else {
				map_container.selectAll(".province")
					.data(map_data);
			}
			
			// Create circles with area corresponding to the number of daily cases
			if (new_map==true) {
				circle_container.selectAll(".province-circles")
					.data(map_data)
					.enter()
					.append("circle")
					.classed("province-circles", true)
					.attr("r", (d)=>Math.sqrt(radius_scale(d.properties.cases)))
					.attr("transform", function(d){
						var off_x = path_generator.centroid(d)[0]+150;
						var off_y = path_generator.centroid(d)[1]-150;
						return "translate("+off_x+off_y+")";
					})
					.style("fill", "red");
			} else {
				circle_container.selectAll(".province-circles")
					.data(map_data)
					.attr("r", (d)=>Math.sqrt(radius_scale(d.properties.cases)))
					.attr("transform", function(d){
						var off_x = path_generator.centroid(d)[0]+150;
						var off_y = path_generator.centroid(d)[1]-150;
						return "translate("+off_x+off_y+")";
					})
					.style("fill", "red");
			}
			
			// Make the axis representing the cirle area
			if (new_map==true) {
				$this.makeCirclebar($this.svg, radius_scale, [250, -300], [20, $this.svg_height - 2*30]);
			}
		});
	}
	
	// Update the causes when filtering the group, playing or dragging the time slider
	function updateCauses(date, gender, age, new_map=false) {
		var causes_promise = d3.csv("data/infection_causes.csv").then((data)=>{
			var filter_data = data.filter(function(a){return (a.date==formatDateString(date))&(a.sex==gender)&(a.age==age)});
			
			filter_data.sort(function(a,b){return d3.descending(parseInt(a.total_city_cases), parseInt(b.total_city_cases))});
		
			var causes_container;
			var limit;
			
			var displayButton = d3.select("#display");
			
			// Display either 5 causes or all the causes
			if (displayButton.node().value=="Five") {
				limit = 5; 
			} else if (displayButton.node().value=="All") {
				limit = 23;
			}
			
			// Create an emoji for each of the possible causes
			function search_emojis(d, i) {
				if (i<limit) {
					if (d.infection_case == 'Unknown Reason') {
						return "PNG/Unknown.png";
					} else if (d.infection_case == 'overseas inflow') {
						return "PNG/overseas inflow.png";
					} else if (d.infection_case == 'contact with patient') {
						return "PNG/contact with patient.png";
					} else if (d.infection_case == "Shincheonji Church" || d.infection_case == "Dongan Church" || d.infection_case == "Onchun Church" || d.infection_case=="Geochang Church" || d.infection_case=="River of Grace Community Church") {
						return "PNG/Church.png";
					} else if (d.infection_case == "Bonghwa Pureun Nursing Home" || d.infection_case=="Gyeongsan Seorin Nursing Home") {
						return "PNG/Nursing Home.png";
					} else if (d.infection_case== "Cheongdo Daenam Hospital" || d.infection_case=="Eunpyeong St. Mary's Hospital") {
						return "PNG/Hospital.png";
					} else if (d.infection_case == "Changnyeong Coin Karaoke") {
						return "PNG/karaoke.png";
					} else if (d.infection_case=="gym facility in Cheonan" || d.infection_case=="gym facility in Sejong") {
						return "PNG/gym.png";
					} else if (d.infection_case == "Guro-gu Call Center") {
						return "PNG/Call Center.png"
					} else if (d.infection_case == "Seongdong-gu APT" || d.infection_case=="Gyeongsan Jeil Silver Town" || d.infection_case=="Ministry of Oceans and Fisheries") {
						return "PNG/Office.png"
					} else if (d.infection_case == "Gyeongsan Community Center" || d.infection_case == "Milal Shelter") {
						return "PNG/center.png"
					} else if (d.infection_case=="Pilgrimage to Israel") {
						return "PNG/Israel.png"
					} else if (d.infection_case=="Suyeong-gu Kindergarten") {
						return "PNG/kindergarten.png"
					} else if (d.infection_case=="Itaewon Clubs") {
						return "PNG/nightclubs.png"
					}
				}
			}
			
			// The causes are represented as a list
			if (new_map==true) {
			 	causes_container = d3.select("#Causes").append('ul').attr("class", "Causes");
			} else {
				d3.select("#Causes").select(".Causes").selectAll("li").selectAll("*").remove();
				causes_container = d3.select("#Causes").select(".Causes");
			}
			
			if (new_map==true) {
				
				var emojis = causes_container.selectAll("li")
					.data(filter_data)
					.enter()
					.append("li");
				
					// append the emoji
					emojis.append("img").classed("emojis", true)
					.attr("src", function(d, i){return search_emojis(d,i)})
					.attr("width", "40px")
					.style("margin-right", "30px")
					
					// Append the cause text
					emojis.append("span").classed("emojis_text1", true)
						.text((d)=>d.infection_case) 
						.style("display", function(d,i){
							if (i<limit){
								return "inline-block";
							} else {
								return "none";
							}
						})
						.style("width", "400px");
					
					// Append the total number of cases linked to that causes
					emojis.append("span").classed("emojis_text2", true)
						.text((d)=>"Total cases: " + Math.round(d.total_city_cases))
						.attr("transform", function(d,i) {
							if (i<limit) {
								var offset = -450 + 49*i;
								return "translate(600,"+offset+")";
							} 
						})
						.style("display", function(d,i){
							if (i<limit){
								return "inline-block";
							} else {
								return "none";
							}
						});
			} else {
				var emojis = causes_container.selectAll("li")
					.data(filter_data);
				
				
					emojis.append("img").classed("emojis", true)
					.attr("src", function(d, i){return search_emojis(d,i)})
					.attr("width", "40px")
					.style("margin-right", "30px")
					
					
					emojis.append("span").classed("emojis_text1", true)
						.text((d)=>d.infection_case) 
						.style("display", function(d,i){
							if (i<limit){
								return "inline-block";
							} else {
								return "none";
							}
						})
						.style("width", "400px");
					

					emojis.append("span").classed("emojis_text2", true)
						.text((d)=>"Total cases: " + Math.round(d.total_city_cases))
						.attr("transform", function(d,i) {
							if (i<limit) {
								var offset = -450 + 49*i;
								return "translate(600,"+offset+")";
							} 
						})
						.style("display", function(d,i){
							if (i<limit){
								return "inline-block";
							} else {
								return "none";
							}
						});
			}
		})
	}	
}
		
	
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
		
		// Give a South Korea natural projection
		const projection = d3.geoNaturalEarth1()
			.rotate([0,0])
			.center([128, 36])
			.scale(5000)
			.translate([this.svg_width, this.svg_height/2-200])
			.precision(0.1);
			
		const path_generator = d3.geoPath()
			.projection(projection);
			
		const radius_scale = d3.scaleLinear()
			.range([0, 500]);
			
		Promise.all([time_promise]).then((results)=> {
			let time_value = results[0];
			this.makeSlider(this.svg, time_value, svg_element_id, Type, projection, path_generator, radius_scale);
		})
		
	};
}

function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

// Make the notes to explain the administrative division of South Korea
class MakeNotesCircles {
	constructor(Type) {
		this.Type = Type;
		
		if (this.Type==="provinces") {
			d3.select(".Notes2").selectAll("*").remove();
			d3.select(".Notes2").append("text").text("Note: The provinces correspond to the 6 metropolitain cities,"+"\n"+"a special city (Seoul), a special autonomous city (Sejong) and the 9 provinces.");
		}
		else if (this.Type=="municipalities") {
			d3.select(".Notes2").selectAll("*").remove();
			d3.select(".Notes2").append("text").text("Note: The municipalities correspond to the cities, counties" +"\n"+ "and districts of South Korea.")
		}
	}
}

whenDocumentLoaded(() => {
	// Clicking to either province or municipalities will create the corresponding map and switch the time bck to the first day
	document.getElementById("provinces2").click();
	text = new MakeNotesCircles("provinces");
	const radios = document.getElementsByName("MapType2");
	var Type = 'provinces';
	plot_object = new MapCircle('circles', Type);
	for (var i = 0, max=radios.length; i<max; i++) {
		radios[i].onclick = function () {
			d3.select('#circles').selectAll('*').remove();
			d3.select('#Causes').selectAll('*').remove();
			Type = this.value;
			text = new MakeNotesCircles(Type);
			plot_object = new MapCircle('circles', Type);
		}
	}
});

