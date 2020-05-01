
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
	
	constructor(svg_element_id){
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
			
		const disease_promise = d3.csv("data/test.csv").then((data)=>{
			let province_daily = {};
			data.forEach((row)=> {
				province_daily[row.province] = parseFloat(row.province_cases);
			});
			return province_daily;
		});
			
		const map_promise = d3.json('json/skorea-provinces-topo.json').then((topojson_raw)=> {
			const province_paths = topojson.feature(topojson_raw,  topojson_raw.objects.provinces);
			return province_paths.features;
		});
		
		Promise.all([map_promise, disease_promise]).then((results)=> {
			let map_data = results[0];
			let province_disease = results[1];
			
			map_data.forEach(province => {
				province.properties.cases = province_disease[province.properties.NAME_1]
			})
			
			const cases = Object.values(province_disease);
			
			radius_scale.domain([0, 100]);
			
			this.map_container = this.svg.append('g');
			this.label_container = this.svg.append('g');
			this.circle_container = this.svg.append('g');
			
			this.map_container.selectAll(".province")
				.data(map_data)
				.enter()
				.append("path")
				.classed("province", true)
				.attr("d", path_generator)
				.style("fill", 'white');
				
			this.label_container.selectAll(".province-label")
				.data(map_data)
				.enter().append("text")
				.classed("province-label", true)
				.attr("transform", (d) => "translate(" + path_generator.centroid(d) + ")")
				//.translate((d) => path_generator.centroid(d))
				.attr("dy", ".35em")
				.attr("dx", "-1em")
				.text((d) => d.properties.NAME_1)
				.attr("font-weight", 900)
				.style("font-size", "10px");
				
				
			this.circle_container.selectAll(".province-circles")
				.data(map_data)
				.enter()
				.append("circle")
				.classed("province-circles", true)
				.attr("r", (d)=>Math.sqrt(radius_scale(d.properties.cases)))
				.attr("transform", (d)=> "translate("+path_generator.centroid(d)+")")
				.style("fill", "red");
				
			this.makeCirclebar(this.svg, radius_scale, [50, 30], [20, this.svg_height - 2*30]);
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
	plot_object = new MapCircle('circles');
	// plot object is global, you can inspect it in the dev-console
});

