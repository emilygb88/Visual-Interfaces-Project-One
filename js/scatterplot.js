class Scatterplot {

    constructor(_config, _data, _xAttribute, _yAttribute) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 500,
        containerHeight: _config.containerHeight || 300,
        margin: _config.margin || {top: 25, right: 20, bottom: 40, left: 35}, 
        tooltipPadding: _config.tooltipPadding || 15
      }
      this.data = _data;
      this.initVis();
      this.xAttribute = _xAttribute;
      this.yAttribute = _yAttribute;
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
    
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width]);
    
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);
    
        vis.xAxis = d3.axisBottom(vis.xScale);
        vis.yAxis = d3.axisLeft(vis.yScale);
    
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);
    
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
    
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);
    
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis');
    
        // X-Axis Label
        vis.svg.append('text')
            .attr('class', 'x-axis-label')
            .attr('x', vis.config.containerWidth / 2)
            .attr('y', vis.config.containerHeight - 10)
            .attr('text-anchor', 'middle')
            .text('');
    
        // Y-Axis Label    
        vis.svg.append('text')
            .attr('class', 'y-axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -vis.config.containerWidth *0.27 )
            .attr('y', 15)
            .attr('dy', '.71em')
            .attr('text-anchor', 'middle')
            .text('');
    
        vis.xValue = d => d[vis.xAttribute];
        vis.yValue = d => d[vis.yAttribute];
    }
    
  
    updateVis(xAttribute, yAttribute, xAttributeLabel, yAttributeLabel) {
      let vis = this;
      
      vis.xAttribute = xAttribute;
      vis.yAttribute = yAttribute;
      vis.xAttributeLabel = xAttributeLabel;
      vis.yAttributeLabel = yAttributeLabel;

      const filteredData = vis.data.filter(d => d[vis.xAttribute] !== -1 && d[vis.yAttribute] !== -1);
      
      vis.xScale.domain([0, d3.max(filteredData, vis.xValue)]);
      vis.yScale.domain([0, d3.max(filteredData, vis.yValue)]);

      vis.xAxis.tickFormat(d => this.mapNumericToLabel(xAttribute, d));

      vis.yAxis.tickFormat(d => this.mapNumericToLabel(yAttribute, d));
  
      vis.xAxisG
          .call(vis.xAxis)
          .call(g => g.select('.domain').remove());
  
      vis.yAxisG
          .call(vis.yAxis)
          .call(g => g.select('.domain').remove());
  
      vis.svg.select('.x-axis-label')
          .text(xAttributeLabel); 
  
      vis.svg.select('.y-axis-label')
          .text(yAttributeLabel); 
  
      vis.circles = vis.chart.selectAll('.point')
      .data(filteredData)
      .join('circle')
          .attr('class', 'point')
          .attr('r', 4)
          .attr('cy', d => vis.yScale(vis.yValue(d)))
          .attr('cx', d => vis.xScale(vis.xValue(d)))
          .attr('fill','#c5cc49')
          .attr('opacity', 0.8);
  
        vis.circles
        .on('mouseover', (event, d) => {
            d3.select('#tooltip')
                .style('display', 'block')
                .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
                .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                .html(`
                    <div> County: ${d.display_name}</div>
                    <div> ${xAttributeLabel}: ${this.mapNumericToLabel(xAttribute, d[vis.xAttribute])}</div>
                    <div> ${yAttributeLabel}: ${this.mapNumericToLabel(yAttribute, d[vis.yAttribute])}</div>
                `);
        })
        .on('mouseleave', () => {
            d3.select('#tooltip').style('display', 'none');
        });
    }
}