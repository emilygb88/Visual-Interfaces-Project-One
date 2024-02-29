class Histogram {
    /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   * @param {Function} xValue
   * @param {string} xValueLabel
   */
    constructor(_config, _data, xValue, xValueLabel, colorScale) {
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
      this.colorScale =  colorScale;
      this.initVis();
    }
    mapNumericToLabel(attribute, value) {
        if (attribute === 'urban_rural_status') {
            const labelMap = {
                1: 'Rural',
                2: 'Small City',
                3: 'Suburban',
                4: 'Urban'
            };
            return labelMap[value] || value;
        }
        return value;
    }

    
    initVis() {
        let vis = this;
    
        // Calculate inner chart size. Margin specifies the space around the actual chart.
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
    
        // Initialize scales
        vis.xScale = d3.scaleLinear()
            .domain([0, 100]) 
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
    
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
    
        // Append x-axis group
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);
    
        // Append y-axis group
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis')
            .attr('transform', `translate(-10, 0)`); 
    
        // Append x-axis label
        vis.svg.append('text')
            .attr('class', 'x-axis-label')
            .attr('x', vis.config.containerWidth / 2)
            .attr('y', vis.config.containerHeight - 10)
            .attr('text-anchor', 'middle')
            .text(vis.xValueLabel);
    
        // Append y-axis label
        vis.svg.append('text')
            .attr('class', 'y-axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -vis.config.containerWidth *0.27 )
            .attr('y', 15)
            .attr('dy', '.71em')
            .attr('text-anchor', 'middle')
            .text('');
    
        // Specify accessor function for x-value
        vis.xValue = d => d[vis.xValue];
    }
    
  
    updateVis(attribute, xAxisLabel) {
        let vis = this;
        vis.attribute = attribute;
        vis.xAxisLabel = xAxisLabel; 
    
        // Update x-axis domain based on the attribute
        if (xAxisLabel.toLowerCase().includes('%')) {
            vis.xScale.domain([0, 60]);
        } else if (xAxisLabel.toLowerCase().includes('median')) {
            vis.xScale.domain([0, 160000]);
        } else if (xAxisLabel.toLowerCase().includes('air')) {
            vis.xScale.domain([0, 20]);
        } else if (xAxisLabel.toLowerCase().includes('park')) {
            vis.xScale.domain([0, 110]);
        } else if (xAxisLabel.toLowerCase().includes('hospital')) {
            vis.xScale.domain([0, 30]);
        } else if (xAxisLabel.toLowerCase().includes('primary')) {
            vis.xScale.domain([0, 30]);
        } else if (xAxisLabel.toLowerCase().includes('urban')) {
        vis.xScale.domain([0, 6]);
        }
        else {
            vis.xScale.domain([0, 100])
        }
    
        
        // Compute histogram bins with updated domain
        const histogram = d3.histogram()
            .value(attribute) 
            .domain(vis.xScale.domain()) 
            .thresholds(vis.xScale.ticks(12));
    
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
                .attr("x2", vis.width) 
                .attr("stroke-dasharray", "2,2"));
    
        vis.svg.select('.x-axis-label')
            .text(xAxisLabel);

        vis.svg.select('.y-axis-label')
            .text('Number of Counties'); 
    
        // Update bars
        vis.bars = vis.chart.selectAll('.bar')
            .data(bins)
            .join('rect')
            .attr('class', 'bar')
            .attr('x', d => vis.xScale(d.x0))
            .attr('width', d => Math.max(0, vis.xScale(d.x1) - vis.xScale(d.x0) - 1))
            .attr('y', d => vis.yScale(d.length)) 
            .attr('height', d => vis.height - vis.yScale(d.length)) 
            .attr('fill', this.colorScale)
            .attr('opacity', 0.7)
            .on('mouseover', function(event, d) {
                let x;
                if (xAxisLabel.toLowerCase().includes('urban')) {
                    const labelX0 = vis.mapNumericToLabel('urban_rural_status', Math.round(d.x0));
                    // const labelX1 = vis.mapNumericToLabel(attribute, Math.round(d.x1));
                    x = `
                    <div><strong>${d.length}</strong> counties</div>
                    <div>Category: <strong>${labelX0}</strong></div>
                `
                } else{
                    x = `
                    <div><strong>${d.length}</strong> counties</div>
                    <div>Range: <strong>${Math.round(d.x0)}</strong> - <strong>${Math.round(d.x1)}</strong></div>
                `
                }
                
                // Show tooltip
                d3.select('#histogram-tooltip')
                    .style('display', 'block')
                    .style('opacity', 0.9)
                    .html(x)
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