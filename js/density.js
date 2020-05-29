class DensityMapPlot {
    // reusing some code from the exercise session
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

    // fills the map with current feature and region
    fill() {
        const feature = this.feature;
        const name_property = this.name_property;
        this.svg.select("defs").remove();
        this.svg.select("#colorbar").remove();
        this.svg.empty();

        // adapting the scale
        const maxValue = Math.max(...this.source.map(o => o.properties[this.feature]), 0);
        const minValue = Math.min(...this.source.map(o => o.properties[this.feature]), 1e6);
        this.scale.domain([minValue, maxValue]);

        let tooltip = d3.select('body').append('div')
            .attr('class', 'hidden tooltip');

        // filling the map, adding tooltip and setting its mouseover
        this.map_container.selectAll(".province").data(this.source)
            .enter()
            .append("path")
            .classed("province", true)
            .attr("d", this.path_generator)
            .style("fill", (d) => this.scale(d.properties[feature]))
            .style("stroke-width", 0.2)
            .on('mouseover', function(d) {
                d3.select(this).style("stroke-width", 1);
                let mouse = d3.mouse(this).map(function(d) {
                    return parseInt(d);
                });
                tooltip.classed('hidden', false)
                    .attr('style', 'left:' + (100 + mouse[0]) +
                        'px; top:' + (4840 + mouse[1]) +"px")
                    .html(d.properties[name_property] + ": " + d.properties[feature]);
            })
            .on('mouseout', function() {
                d3.select(this).style("stroke-width", 0.2);
                tooltip.classed('hidden', true);
            });
        this.makeColorbar(this.svg, this.scale, [0, 50], [20, this.svg_height - 2*30], this.class);
    }

    constructor(svg_element_id, feature, scale=d3.scaleLog().range(["hsl(62,100%,90%)", "hsl(12,136%,52%)"]).interpolate(d3.interpolateHcl)) {
        this.feature = feature;
        this.scale = scale;
        this.class = d3.scaleLog;
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
        this.path_generator = d3.geoPath()
            .projection(projection);

        // data for provinces
        const population_promise = d3.csv("data/agg.csv").then((data) => {
            return data.reduce((acc, d) => {
                acc[d.province] = d;
                return acc;
            }, {});
        });

        // data for municipalities
        const provinces_stats_promise = d3.csv("data/Region.csv").then((data) => {
            return data.reduce((acc, d) => {
                acc[d.city] = d;
                return acc;
            }, {});
        });

        // topojson for provinces
        const provinces_promise = d3.json("json/skorea-provinces-topo.json").then((topojson_raw) => {
            const canton_paths = topojson.feature(topojson_raw, topojson_raw.objects.provinces);
            return canton_paths.features;
        });

        // topojson data for municipalities
        const municipalities_promise = d3.json("json/skorea-municipalities-topo.json").then((topojson_raw) => {
            const canton_paths = topojson.feature(topojson_raw, topojson_raw.objects.municipalities);
            return canton_paths.features;
        });

        Promise.all([provinces_promise, municipalities_promise, population_promise, provinces_stats_promise])
            .then((results) => {
            this.provinces_data = results[0];
            this.municipalities_data = results[1];
            let province_stats = results[2];
            let municip_stats = results[3];
            this.map_container = this.svg.append('g');

            // parsing data
            this.provinces_data.forEach((province) => {
                province.properties.density = parseFloat(province_stats[province.properties.NAME_1].population_density);
                province.properties.schools = parseFloat(province_stats[province.properties.NAME_1].elementary_school_count);
                province.properties.universities = parseFloat(province_stats[province.properties.NAME_1].university_count);
                province.properties.nursing_homes = parseFloat(province_stats[province.properties.NAME_1].nursing_home_count);
                province.properties.elderly = parseFloat(province_stats[province.properties.NAME_1].elderly_population_ratio);
            });
            this.municipalities_data.forEach((province) => {
                province.properties.density = parseFloat(municip_stats[province.properties.NAME_2].density);
                province.properties.schools = parseFloat(municip_stats[province.properties.NAME_2].elementary_school_count);
                province.properties.universities = parseFloat(municip_stats[province.properties.NAME_2].university_count);
                province.properties.nursing_homes = parseFloat(municip_stats[province.properties.NAME_2].nursing_home_count);
                province.properties.elderly = parseFloat(municip_stats[province.properties.NAME_2].elderly_population_ratio);
            });
            this.source = this.provinces_data;
            this.name_property = "NAME_1";
            this.fill();
        });
    }
}

whenDocumentLoaded(() => {
    let feature_selector = document.getElementsByName("featureselect");
    let prov_button = document.getElementById("region_prov");
    let mun_button = document.getElementById("region_mun");
    let densityMap = new DensityMapPlot('density_map', "density");
    // setting events on radio buttons
    // every time a feature or region type changes we clear and refill the map
    prov_button.onclick = (() => {
        densityMap.map_container.selectAll("*").remove();
        densityMap.source = densityMap.provinces_data;
        densityMap.name_property = "NAME_1";
        densityMap.fill();
    });
    mun_button.onclick = (() => {
        densityMap.map_container.selectAll("*").remove();
        densityMap.source = densityMap.municipalities_data;
        densityMap.name_property = "NAME_2";
        densityMap.fill();
    });
    feature_selector.forEach((input) => {
        input.onclick = (() => {
            densityMap.feature = input.value;
            if(densityMap.feature === "density"){
                densityMap.scale = d3.scaleLog().range(["hsl(62,100%,90%)", "hsl(12,136%,52%)"]).interpolate(d3.interpolateHcl);
                densityMap.class = d3.scaleLog;
            } else {
                densityMap.scale = d3.scaleLinear().range(["hsl(62,100%,90%)", "hsl(12,136%,52%)"]).interpolate(d3.interpolateHcl);
                densityMap.class = d3.scaleLinear;
            }
            densityMap.map_container.selectAll("*").remove();

            densityMap.fill();
        });
    });
});