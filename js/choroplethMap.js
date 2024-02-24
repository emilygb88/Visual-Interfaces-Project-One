class ChoroplethMap {
  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 600,
      containerHeight: _config.containerHeight|| 600,
      margin: _config.margin || {top: 10, right: 10, bottom: 10, left: 10},
      tooltipPadding: 10,
      legendBottom: 50,
      legendLeft: 50,
      legendRectHeight: 12, 
      legendRectWidth: 180,
    }
    this.data = _data;
    // this.config = _config;

    this.us = _data;

    this.active = d3.select(null);

    this.initVis();
  }
  
  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
    
    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('class', 'center-container')
        .attr('width', 600)
        .attr('height', 600);

    // Append background
    vis.svg.append('rect')
        .attr('class', 'background')
        .attr('height', vis.config.containerWidth || 200)
        .attr('width', vis.config.containerHeight)
        .attr('fill', 'white')
        .on('click', vis.clicked);

    // Define projection
    vis.projection = d3.geoAlbersUsa()
        .translate([vis.width / 2, vis.height / 2])
        .scale(vis.width);

    // Define color scale
    vis.colorScale = d3.scaleLinear()
        .domain(d3.extent(vis.data.objects.counties.geometries, d => d.properties.pop))
        .range(['#cfe2f2', '#0d306b'])
        .interpolate(d3.interpolateHcl);

    // Define path generator
    vis.path = d3.geoPath()
        .projection(vis.projection);

    // Append counties
    vis.g = vis.svg.append("g")
        .attr('class', 'center-container center-items us-state')
        .attr('transform', 'translate(' + vis.config.margin.left + ',' + vis.config.margin.top + ')')
        .attr('width', vis.width )
        .attr('height', vis.height);

    vis.counties = vis.g.append("g")
        .attr("id", "counties")
        .selectAll("path")
        .data(topojson.feature(vis.us, vis.us.objects.counties).features)
        .enter().append("path")
        .attr("d", vis.path)
        .attr('fill', d => {
            if (d.properties.pop) {
                return vis.colorScale(d.properties.pop);
            } else {
                return 'url(#lightstripe)';
            }
        })
        .on('mousemove', (d, event) => {
            d3.select('#tooltip-map')
                .style('display', 'block')
                .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
                .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                .html(`
                        <div class="tooltip-title">HI</div>
                        <div>Hello there</div>
                    `);
        })
        .on('mouseleave', () => {
            d3.select('#tooltip-map').style('display', 'none');
        });

    // Append state borders
    vis.g.append("path")
        .datum(topojson.mesh(vis.us, vis.us.objects.states, function(a, b) { return a !== b; }))
        .attr("id", "state-borders")
        .attr("d", vis.path);

    // Add legend
    vis.addLegend();
}

    addLegend() {
      let vis = this;

    // Append legend SVG element
    vis.legend = vis.svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${vis.width + vis.config.margin.left + 10 - 70},${vis.config.margin.top + 350})`);

    // Append linear gradient definition
    const gradient = vis.legend.append('defs')
    .append('linearGradient')
    .attr('id', 'legend-gradient')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '100%')
    .attr('y2', '0%');

    // Define color stops for the gradient based on the color scale domain
    const colorStops = vis.colorScale.range().map((color, i) => {
    return {
        offset: i / (vis.colorScale.range().length - 1),
        color: color
    };
    });

    // Append color stops to the gradient
    colorStops.forEach(stop => {
    gradient.append('stop')
        .attr('offset', (stop.offset * 100) + '%')
        .attr('stop-color', stop.color);
    });

    // Append rectangle with gradient fill to represent legend
    vis.legend.append('rect')
    .attr('width', vis.config.legendRectWidth)
    .attr('height', vis.config.legendRectHeight)
    .style('fill', 'url(#legend-gradient)');

    // Add text labels to the legend
    const legendLabels = vis.colorScale.ticks(5);
    const labelWidth = vis.config.legendRectWidth / (legendLabels.length - 1); 
    vis.legend.selectAll('.legend-label')
    .data(legendLabels)
    .enter().append('text')
    .attr('class', 'legend-label')
    .attr('text-anchor', 'middle')
    .attr('x', (d, i) => i * labelWidth) 
    .attr('y', vis.config.legendRectHeight * 2)
    .text(d => d);
    }
}