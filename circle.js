
class MapCircle {
	
	makeCirclebar(svg, color_scale, top_left, colorbar_size, scaleClass=d3.scaleLinear) {

		const value_to_svg = d3.scalePoint()
			.domain([1, 10, 100])
			.range([colorbar_size[1], 0]);
		
		const range01_to_radius = d3.scaleLinear()
			.domain([0, 100])
			.range([0, 400]);

		// Axis numbers
		const colorbar_axis = d3.axisLeft(value_to_svg)
			.tickFormat(d3.format(".0f"))

		const colorbar_g = this.svg.append("g")
			.attr("id", "colorbar")
			.attr("transform", "translate(" + top_left[0] + ', ' + top_left[1] + ")")
			.call(colorbar_axis)
			.selectAll('.tick')
				.append("circle")
				.attr('r', (d)=>Math.sqrt(range01_to_radius(d)))
				.attr("cx", 50)
				.style("fill", "red");	
		}
		
		
	makeSlider(svg) {
		
		var timer;
		
		var currentValue = 0;
		var targetValue = 700;
		
		var playButton = d3.select("#PlayButton2");
		var pauseButton = d3.select("#PauseButton2");
		var restartButton = d3.select("#RestartButton2");
		
		var formatDate = d3.timeFormat("%d %B %Y");
		var formatDateintoMonth = d3.timeFormat("%B");
		
		const startDate = new Date("2020-02-01");
		const endDate = new Date("2020-04-15");

		var time_value = d3.scaleTime()
			.domain([startDate, endDate])
			.range([0, targetValue])
			.clamp(true);
		
		function step() {
			update(time_value.invert(currentValue));
			currentValue = currentValue + (targetValue/151);
			if (currentValue > targetValue) {
				clearInterval(timer);
			}
		}
		
		function update(h) {
			handle.attr("cx", time_value(h));
			label.attr("x", time_value(h))
			.text(formatDate(h))
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
			.text(formatDate(startDate))
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
		
	}		
		
	
	constructor(svg_element_id, Type){
		this.svg = d3.select('#' + svg_element_id);
		const svg_viewbox = this.svg.node().viewBox.animVal;
		this.svg_width = svg_viewbox.width;
		this.svg_height = svg_viewbox.height;
		
		const projection = d3.geoNaturalEarth1()
			.rotate([0,0])
			.center([128, 36])
			.scale(5000)
			.translate([this.svg_width, this.svg_height/2])
			.precision(0.1);
			
		const path_generator = d3.geoPath()
			.projection(projection);
			
		const radius_scale = d3.scaleLinear()
			.range([0, 400]);
			
		var disease_promise = d3.csv("data/test.csv").then((data)=>{
			let province_concentration = {};
			data.forEach((row)=> {
				province_concentration[row.province] = parseFloat(row.province_cases);
			});
			return province_concentration;
		});
			
		var map_promise = d3.json('json/skorea-provinces-topo.json').then((topojson_raw)=> {
			const province_paths = topojson.feature(topojson_raw,  topojson_raw.objects.provinces);
			return province_paths.features;
		});
			
		if (Type=='provinces') {
			disease_promise = d3.csv("data/test.csv").then((data)=>{
				let province_concentration = {};
				data.forEach((row)=> {
					province_concentration[row.province] = parseFloat(row.province_cases);
				});
				return province_concentration;
			});
			
			map_promise = d3.json('json/skorea-provinces-topo.json').then((topojson_raw)=> {
				const province_paths = topojson.feature(topojson_raw,  topojson_raw.objects.provinces);
				return province_paths.features;
			});
		} else if (Type='municipalities') {
			disease_promise = d3.csv("data/test.csv").then((data)=>{
				let province_concentration = {};
				data.forEach((row)=> {
					province_concentration[row.province] = parseFloat(row.city_cases);
				});
				return province_concentration;
			});
			
			map_promise = d3.json('json/skorea-municipalities-topo.json').then((topojson_raw)=> {
				const province_paths = topojson.feature(topojson_raw,  topojson_raw.objects.municipalities);
				return province_paths.features;
			});
		}
		
		function handleMouseOver(d, i) {
			var coords = d3.mouse(this)
			var svg = d3.select('#' + svg_element_id);
			d3.select(this).style('stroke-width', 1)
			if (Type=='provinces') {
				d3.select('#' + svg_element_id).append('text')
					.attr("id", "t"+d.properties.NAME_1)
					.attr("x", coords[0]-30)
					.attr("y", coords[1]-15)
					.text(d.properties.NAME_1+' Daily cases : '+d.properties.cases);
			} else if (Type='municipalities') {
				d3.select('#' + svg_element_id).append('text')
					.attr("id", "t"+d.properties.NAME_1)
					.attr("x", coords[0]-30)
					.attr("y", coords[1]-15)
					.text(d.properties.NAME_2+' Daily cases : '+d.properties.cases);
			}
		}
		
		function handleMouseOut(d, i) {
			d3.selectAll('.province').style('stroke-width', 0.2);
			d3.select("#t"+d.properties.NAME_1).remove();
		}
		
		Promise.all([map_promise, disease_promise]).then((results)=> {
			let map_data = results[0];
			let province_disease = results[1];
			
			map_data.forEach(province => {
				province.properties.cases = province_disease[province.properties.NAME_1]
			})
			
			const cases = Object.values(province_disease);
			
			radius_scale.domain([0, 100]);
			
			const map_container = this.svg.append('g');
			const circle_container = this.svg.append('g');
			
			const zoom = d3.zoom()
				.scaleExtent([1, 8])
				.on('zoom', zoomed);
		
			this.svg.call(zoom);
			
			map_container.selectAll(".province")
				.data(map_data)
				.enter()
				.append("path")
				.classed("province", true)
				.attr("d", path_generator)
				.style("fill", 'white')
				.on('mouseover', handleMouseOver)
				.on('mouseout', handleMouseOut);

				
				
			circle_container.selectAll(".province-circles")
				.data(map_data)
				.enter()
				.append("circle")
				.classed("province-circles", true)
				.attr("r", (d)=>Math.sqrt(radius_scale(d.properties.cases)))
				.attr("transform", (d)=> "translate("+path_generator.centroid(d)+")")
				.style("fill", "red");
				
			function zoomed() {
				var t = d3.event.transform;
				map_container.selectAll('path')
				.attr('transform', t);
				circle_container.selectAll("circle")
				.attr("transform", (d)=> "translate("+[t.k*path_generator.centroid(d)[0]+t.x,+t.k*path_generator.centroid(d)[1]+t.y]+")");
			}
				
			this.makeCirclebar(this.svg, radius_scale, [50, 30], [20, this.svg_height - 2*30]);
			this.makeSlider(this.svg);
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

whenDocumentLoaded(() => {
	const radios = document.getElementsByName("MapType2");
	var Type = 'provinces';
	plot_object = new MapCircle('circles', Type);
	for (var i = 0, max=radios.length; i<max; i++) {
		radios[i].onclick = function () {
			d3.select('#circles').selectAll('*').remove();
			Type = this.value;
			plot_object = new MapCircle('circles', Type);
		}
	}
	// plot object is global, you can inspect it in the dev-console
});

