class DensityMapPlot {

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
        //colormap for population density

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

    constructor(svg_element_id) {
        let tooltip = d3.select('body').append('div')
            .attr('class', 'hidden tooltip');
        console.log(tooltip);
        this.svg = d3.select('#' + svg_element_id);
        const svg_viewbox = this.svg.node().viewBox.animVal;
        this.svg_width = svg_viewbox.width;
        this.svg_height = svg_viewbox.height;
        const projection = d3.geoNaturalEarth1()
            .rotate([0, 0])
            .center([127.86, 36.58])
            .scale(4000)
            .translate([this.svg_width / 2, this.svg_height / 2]) // SVG space
            .precision(.1);
        // may be useful for calculating scales

        const path_generator = d3.geoPath()
            .projection(projection);
        //colormap for population density
        this.color_scale = d3.scaleLog()
            .range(["hsl(62,100%,90%)", "hsl(228,30%,20%)"])
            .interpolate(d3.interpolateHcl);
        const population_promise = d3.csv("data/convertcsv.csv").then((data) => {
            return data.reduce((acc, d) => {
                acc[d.name] = d;
                return acc;
            }, {});
        });

        const map_promise = d3.json("json/skorea-provinces-topo.json").then((topojson_raw) => {
            const canton_paths = topojson.feature(topojson_raw, topojson_raw.objects.provinces);
            return canton_paths.features;
        });

        const agg_promise = d3.csv()
/*
        const point_promise = d3.csv("data/locations.csv").then((data) => {

            // process the Instagram data here (optional)

            return data;
        });
*/
        Promise.all([map_promise, population_promise]).then((results) => {
            let map_data = results[0];
            let stats = results[1];
            console.log(stats)
            //let point_data = results[2];
            this.map_container = this.svg.append('g');
            //this.point_container = this.svg.append('g');
            //this.label_container = this.svg.append('g');
            map_data.forEach((province) => {
                province.properties.density = parseFloat(stats[province.properties.NAME_1].density);
            });
            this.color_scale.domain([75, 12000]);
            this.map_container.selectAll(".province").data(map_data)
                .enter()
                .append("path")
                .classed("province", true)
                .attr("d", path_generator)
                .style("fill", (d) => this.color_scale(d.properties.density))
                .style("stroke-width", 0.2)
                .on('mousemove', function(d) {
                    d3.select(this).style("stroke-width", 1);
                    let mouse = d3.mouse(this).map(function(d) {
                        return parseInt(d);
                    });
                    console.log(this);
                    tooltip.classed('hidden', false)
                        .attr('style', 'left:' + (mouse[0] + 100) +
                            'px; top:' + (mouse[1] + 3200) + 'px')
                        .html(d.properties.NAME_1 + ": " + d.properties.density);
                })
                .on('mouseout', function() {
                    d3.select(this).style("stroke-width", 0.2);
                    tooltip.classed('hidden', true);
                });
                //.text((d) => d.properties.NAME_1 + ": " + d.properties.density);
            this.makeColorbar(this.svg, this.color_scale, [50, 30], [20, this.svg_height - 2*30]);
        });
    }
}

whenDocumentLoaded(() => {
    const densityMap = new DensityMapPlot('density_map');
    // plot object is global, you can inspect it in the dev-console
});