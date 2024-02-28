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
        containerHeight: _config.containerHeight || 600,
        margin: _config.margin || { top: 10, right: 10, bottom: 10, left: 10 },
        tooltipPadding: 10,
        legendBottom: 50,
        legendLeft: 50,
        legendRectHeight: 12,
        legendRectWidth: 180,
      };
      this.data = _data;
      this.us = _data;
      this.active = d3.select(null);
  
      // Initialize the visualization
      this.initVis();
    }
  
    /**
     * Initialize the visualization
     */
    initVis() {
        let vis = this;
      
        // Calculate inner chart size. Margin specifies the space around the actual chart.
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
        
        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement).append('svg')
            .attr('class', 'center-container')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);
      
        // Append background
        vis.svg.append('rect')
            .attr('class', 'background')
            .attr('height', vis.config.containerHeight)
            .attr('width', vis.config.containerWidth)
            .attr('fill', 'white')
            .on('click', vis.clicked);
      
        vis.projection = d3.geoAlbersUsa()
            .translate([vis.width / 2, vis.height / 2])
            .scale(vis.width);
      
        // Define color scale
        vis.colorScale = d3.scaleLinear()
            .domain(d3.extent(vis.data.objects.counties.geometries, d => d.properties.pop))
            .range(['#cfe2f2', '#0d306b'])
            .interpolate(d3.interpolateHcl);
            
      
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
            .on('mouseover', function(event, d) {
                const countyData = d.properties;
                // Show tooltip 
                d3.select('#tooltip-map')
                    .style('display', 'block')
                    .style('opacity', 0.9)
                    .html(`
                        <div><strong>County:</strong> ${countyData.name}</div>
                        <div><strong>Poverty Percentage (%):</strong> ${d.properties.pop}</div>
                    `)
                    .style('left', (event.pageX + 20) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function() {
                // Hide tooltip
                d3.select('#tooltip-map')
                    .style('opacity', 0);
            });
      
        vis.g.append("path")
            .datum(topojson.mesh(vis.us, vis.us.objects.states, function(a, b) { return a !== b; }))
            .attr("id", "state-borders")
            .attr("d", vis.path);
      
        // Add legend
        vis.addLegend();
      }
      
  
      addLegend() {
        let vis = this;
    
        // Append the legend element
        vis.legend = vis.svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${vis.width + vis.config.margin.left + 10 - 70},${vis.config.margin.top + 350})`);
    
        const gradient = vis.legend.append('defs')
            .append('linearGradient')
            .attr('id', 'legend-gradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '0%');
    
        const colorStops = [
            { offset: 0, color: vis.colorScale.range()[0] },
            { offset: 1, color: vis.colorScale.range()[1] }
        ];
    
        colorStops.forEach(stop => {
            gradient.append('stop')
                .attr('offset', (stop.offset * 100) + '%')
                .attr('stop-color', stop.color);
        });
    
        vis.legend.append('rect')
            .attr('width', vis.config.legendRectWidth)
            .attr('height', vis.config.legendRectHeight)
            .style('fill', 'url(#legend-gradient)');
    
        // Add low and high text labels 
        vis.legend.selectAll('.legend-label')
            .data(['Low', 'High']) 
            .enter().append('text')
            .attr('class', 'legend-label')
            .attr('text-anchor', (d, i) => i === 0 ? 'start' : 'end') // Adjust text-anchor position
            .attr('x', (d, i) => i === 0 ? 0 : vis.config.legendRectWidth) // Adjust x position
            .attr('y', vis.config.legendRectHeight * 2)
            .text(d => d);
    
    }
  
    /**
 * Update the visualization with new data
 * @param {Object} newData - New data for updating the visualization
 * @param {String} selectedAttribute - The selected attribute being visualized
 */
    updateVis(newGeoData, selectedAttribute, selectedAttributeLabel) {
        const vis = this; 
        vis.data = newGeoData;
        vis.us = newGeoData;
    
        vis.colorScale.domain(d3.extent(vis.data.objects.counties.geometries, d => d.properties.pop));
    
        vis.counties = vis.counties.data(topojson.feature(vis.us, vis.us.objects.counties).features)
            .enter().append("path")
            .attr("d", vis.path)
            .attr('fill', d => {
                if (d.properties.pop) {
                    return vis.colorScale(d.properties.pop);
                } else {
                    return 'url(#lightstripe)';
                }
            });
        
            // Update the tooltips
        vis.counties
            .on('mouseover', function(event, d) {
                const countyData = d.properties;
                // Show tooltip with county and attribute information
                d3.select('#tooltip-map')
                    .style('display', 'block')
                    .style('opacity', 0.9)
                    .html(`
                        <div><strong>County:</strong> ${countyData.name}</div>
                        <div><strong>${selectedAttributeLabel}:</strong> ${d.properties.pop}</div>
                    `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function() {
                // Hide tooltip
                d3.select('#tooltip-map')
                    .style('opacity', 0);
            });

    }
}    