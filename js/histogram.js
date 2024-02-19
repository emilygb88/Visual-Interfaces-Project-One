class Histogram {
  /**
 * Class constructor with basic chart configuration
 * @param {Object}
 * @param {Array}
 * @param {Function} xValue
 * @param {string} xValueLabel
 */
  constructor(_config, _data, xValue, xValueLabel) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 600,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || {top: 25, right: 20, bottom: 50, left: 50},
      tooltipPadding: _config.tooltipPadding || 15
    }
    this.data = _data;
    this.xValue = xValue;
    this.xValueLabel = xValueLabel;
    this.initVis();
  }
  
  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Initialize scales
    vis.xScale = d3.scaleLinear()
        .domain([0, 100]) // Set initial domain for x-axis scale
        .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
        .range([vis.height, 0]);

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
        .ticks(10);

    vis.yAxis = d3.axisLeft(vis.yScale)
        .ticks(10);

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart 
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append x-axis group
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);
    
    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis');

    // Append x-axis label
    vis.svg.append('text')
        .attr('class', 'axis-title')
        .attr('x', vis.config.containerWidth / 2)
        .attr('y', vis.config.containerHeight - 10)
        .attr('text-anchor', 'middle')
        .text(vis.xValueLabel);

    // Append y-axis label
    vis.svg.append('text')
        .attr('class', 'axis-title')
        .attr('transform', 'rotate(-90)')
        .attr('x', -vis.config.containerHeight / 2)
        .attr('y', 15)
        .attr('dy', '.71em')
        .attr('text-anchor', 'middle')
        .text('Number of Counties');

    // Specify accessor function for x-value
    vis.xValue = vis.xValue || (d => d);
}


updateVis() {
  let vis = this;

// Compute histogram bins
const histogram = d3.histogram()
    .value(vis.xValue) // Call the xValue function
    .domain(vis.xScale.domain()) // Set the domain explicitly to ensure consistent bins
    .thresholds(vis.xScale.ticks(20));


  const bins = histogram(vis.data); // Compute bins using data

  // Update scales
  vis.yScale.domain([0, d3.max(bins, d => d.length)]);

  // Update axes/gridlines
  vis.xAxisG
      .call(vis.xAxis)
      .call(g => g.select('.domain').remove());

  vis.yAxisG
      .call(vis.yAxis)
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll(".tick line")
          .attr("x2", vis.width) // Extend gridlines across the width of the chart
          .attr("stroke-dasharray", "2,2")); // Add dashes to gridlines for better visibility

  // Update bars
    vis.bars = vis.chart.selectAll('.bar')
    .data(bins)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', d => vis.xScale(d.x0))
    .attr('width', d => Math.max(0, vis.xScale(d.x1) - vis.xScale(d.x0) - 1))
    .attr('y', d => vis.yScale(d.length)) // Corrected calculation for y position
    .attr('height', d => vis.height - vis.yScale(d.length)) // Height of the bars based on the length of the bins
    .attr('fill', '#d4d645')
    .attr('opacity', 0.7)
    .on('mouseover', function(event, d) {
        // Show tooltip
        d3.select('#histogram-tooltip')
            .style('display', 'block')
            .style('opacity', 0.9)
            .html(`
                <div><strong>${d.length}</strong> counties</div>
                <div>Range: <strong>${Math.round(d.x0)}%</strong> - <strong>${Math.round(d.x1)}%</strong></div>
            `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function() {
        // Hide tooltip
        d3.select('#histogram-tooltip')
            .style('opacity', 0);
    });
}



}