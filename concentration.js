
class MapPlot {
	
	makeColorbar(svg, color_scale, top_left, colorbar_size, scaleClass=d3.scaleLinear) {

		const value_to_svg = scaleClass()
			.domain(color_scale.domain())
			.range([colorbar_size[1], 0.9*colorbar_size[1], 0.81*colorbar_size[1], 0.72*colorbar_size[1], 0.63*colorbar_size[1], 0.54*colorbar_size[1], 0.45*colorbar_size[1], 0.36*colorbar_size[1], 0.27*colorbar_size[1], 0.18*colorbar_size[1], 0.09*colorbar_size[1], 0]);

		const range01_to_color = d3.scaleLinear()
			.domain([0, 0.09, 0.18, 0.27, 0.36, 0.45, 0.54, 0.63, 0.72, 0.81, 0.9, 1])
			.range(color_scale.range())
			.interpolate(color_scale.interpolate());

		// Axis numbers
		const colorbar_axis = d3.axisLeft(value_to_svg)
			.tickFormat(d3.format(".0e"))

		const colorbar_g = this.svg.append("g")
			.attr("id", "colorbar")
			.attr("transform", "translate(" + top_left[0] + ', ' + top_left[1] + ")")
			.call(colorbar_axis);

		// Create the gradient
		function range01(steps) {
			return Array.from(Array(steps), (elem, index) => index / (steps-1));
		}

		const svg_defs = this.svg.append("defs");

		const gradient = svg_defs.append('linearGradient')
			.attr('id', 'colorbar-gradient')
			.attr('x1', '0%') // bottom
			.attr('y1', '100%')
			.attr('x2', '0%') // to top
			.attr('y2', '0%')
			.attr('spreadMethod', 'pad');

		gradient.selectAll('stop')
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
			.style('fill', 'url(#colorbar-gradient)')
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
		var genderButton = d3.select("#Gender1");
		var ageButton = d3.select("#Age1");
		
		var formatDate = d3.timeFormat("%d %B %Y");
		var formatDateintoMonth = d3.timeFormat("%B");
		var formatDateString = d3.timeFormat("%Y-%m-%d");
		
		var targetValue = time_value.range()[1];
		
		var disease_promise;
		var map_promise;
		
		updateMap(time_value.domain()[0], genderButton.node().value, ageButton.node().value, true);
		
		function step() {
			update(time_value.invert(currentValue));
			currentValue = currentValue + (targetValue/300);
			if (currentValue > targetValue) {
				clearInterval(timer);
			}
		}
		
		function update(h) {
			handle.attr("cx", time_value(h));
			label.attr("x", time_value(h))
			.text(formatDate(h))
			genderButton = d3.select("#Gender1");
			ageButton = d3.select("#Age1");
			updateMap(h, genderButton.node().value, ageButton.node().value);
		}
			
		var slider = this.svg.append("g")
			.attr("class", "slider")
			.attr("transform", "translate(20,-70)");	
			
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
		
		var label = slider.append("text")
			.attr("class", "label")
			.attr("text-anchor", "middle")
			.text(formatDate(time_value.domain()[0]))
			.attr("transform", "translate(0, -25)")
		
		playButton.on("click", function() {
			timer = setInterval(step, 100);
		});
		
		pauseButton.on("click", function() {
			clearInterval(timer);
		});
		
		restartButton.on("click", function() {
			currentValue = 0;
			update(time_value.invert(currentValue));
			clearInterval(timer);
		});
		
		function handleMouseOver(d, i) {
			var coords = d3.mouse(this)
			var svg = d3.select('#' + svg_element_id);
			d3.select(this).style('fill-opacity', 1)
			.style('stroke-width', 1)
			if (Type=='provinces') {
				d3.select('#' + svg_element_id).append('text')
					.attr("id", "t"+d.properties.NAME_1)
					.attr("x", coords[0]-30)
					.attr("y", coords[1]-15)
					.text(d.properties.NAME_1+' Total cases : '+d.properties.total_cases);
			} else if (Type=='municipalities') {
				d3.select('#' + svg_element_id).append('text')
					.attr("id", "t"+d.properties.NAME_1)
					.attr("x", coords[0]-30)
					.attr("y", coords[1]-15)
					.text(d.properties.NAME_2+' Total cases : '+d.properties.total_cases);
			}
		}
		
		function handleMouseOut(d, i) {
			d3.selectAll('.province').style('fill-opacity', 0.8)
			.style('stroke-width', 0.2)
			d3.select("#t"+d.properties.NAME_1).remove();
		}

		
		function updateMap(date, gender, age, new_map=false) {
		
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
					map_container = svg.append('g').attr("class", "Map");
				} else {
					map_container = d3.select('#concentration').select(".Map");
				}

				const zoom = d3.zoom()
					.scaleExtent([1, 8])
					.on('zoom', zoomed);
			
				svg.call(zoom);
				
				if (new_map==true) {
					map_container.selectAll(".province")
						.data(map_data)
						.enter()
						.append("path")
						.classed("province", true)
						.attr("d", path_generator)
						.style("fill", (d)=> color_scale(d.properties.density))
						.on('mouseover', handleMouseOver) 
						.on('mouseout', handleMouseOut);
				} else {
					map_container.selectAll(".province")
						.data(map_data)
						.style("fill", (d)=> color_scale(d.properties.density))
				}
				
				function zoomed() {
					map_container.selectAll('path')
					.attr('transform', d3.event.transform);
				}
				
				if (new_map==true) {
					$this.makeColorbar(svg, color_scale, [50, 30], [20, $this.svg_height - 2*30]);
				};
			})
		}
	};
	
	constructor(svg_element_id, Type){
		this.svg = d3.select('#' + svg_element_id);
		const svg_viewbox = this.svg.node().viewBox.animVal;
		this.svg_width = svg_viewbox.width;
		this.svg_height = svg_viewbox.height;
		
		var targetValue = 700;
		
		
		var time_promise = d3.csv("data/All_ALL.csv").then((data) => {
			var time_value = d3.scaleTime()
			.domain(d3.extent(data, function(d){return new Date(d.date);}))
			.range([0, targetValue])
			.clamp(true);
			return time_value;
		})
		
		const projection = d3.geoNaturalEarth1()
			.rotate([0,0])
			.center([128, 36])
			.scale(5000)
			.translate([this.svg_width, this.svg_height/2])
			.precision(0.1);
			
		const path_generator = d3.geoPath()
			.projection(projection);
			
		const color_scale = d3.scaleLinear()
			.domain([0, 2e-6, 4e-6, 8e-6, 1e-5, 2e-5, 4e-5, 8e-5, 1e-4, 2e-4, 4e-4, 8e-4])
			.range(['#b6e200', '#e2c84b', '#e7b94c', '#e9aa4b', '#ea9b49', '#ea8c47', '#ea7d44', '#e86c41', '#e65b3d', '#e4483a', '#e13036', '#dd0032'])
			.interpolate(d3.interpolateHcl);
		
		
		Promise.all([time_promise]).then((results)=> {
			let time_value = results[0];
			this.makeSlider(this.svg, time_value, svg_element_id, Type, projection, path_generator, color_scale);
		})
		
		
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
	const radios = document.getElementsByName("MapType1");
	var Type = 'provinces';
	plot_object = new MapPlot('concentration', Type);
	for (var i = 0, max=radios.length; i<max; i++) {
		radios[i].onclick = function () {
			d3.select('#concentration').selectAll("*").remove();
			Type = this.value;
			plot_object = new MapPlot('concentration', Type);
		}
	}
	// plot object is global, you can inspect it in the dev-console
});

