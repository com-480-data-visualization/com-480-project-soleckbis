
class MapCircle {
	
	makeColorbar(svg, color_scale, top_left, colorbar_size, scaleClass=d3.scaleLog) {

		const value_to_svg = scaleClass()
			.domain(color_scale.domain())
			.range([colorbar_size[1], 0]);

		const range01_to_color = d3.scaleLinear()
			.domain([0, 1])
			.range(color_scale.range())
			.interpolate(color_scale.interpolate());

		// Axis numbers
		const colorbar_axis = d3.axisLeft(value_to_svg)
			.tickFormat(d3.format(".0f"))

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
			.range([0, 50]);
			
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
				.text((d) => d.properties.NAME_1)
				.attr("font-weight", 900)
				.style("font-size", "10px");
				
				
			this.circle_container.selectAll(".province-circles")
				.data(map_data)
				.enter()
				.append("circle")
				.classed("province-circles", true)
				.attr("r", (d)=>radius_scale(d.properties.cases))
				.attr("transform", (d)=> "translate("+path_generator.centroid(d)+")")
				.style("fill", "red");
				
			this.makeColorbar(this.svg, radius_scale, [50, 30], [20, this.svg_height - 2*30]);
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

