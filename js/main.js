Promise.all([
  d3.csv('data/national_health_data.csv'),
  d3.json('data/counties-10m.json')
]).then(data => {
  const csvData = data[0];
  const geoData = data[1];

  // Parse CSV data
  csvData.forEach(d => {
      d.elderly_percentage = +d.elderly_percentage;
      d.percent_high_blood_pressure = +d.percent_high_blood_pressure;
  });

  // Initialize scatterplot
  scatterplot = new Scatterplot({ parentElement: '#scatterplot' }, csvData);
  scatterplot.updateVis();

  // Initialize histograms
  const elderlyPercentageHistogram = new Histogram({
      parentElement: '#histogram-elderly',
      containerWidth: 600,
      containerHeight: 400,
      margin: { top: 25, right: 20, bottom: 50, left: 50 },
  }, csvData, d => d.elderly_percentage, 'Elderly Percentage (%)');

  elderlyPercentageHistogram.updateVis();

  const bloodPressureHistogram = new Histogram({
      parentElement: '#histogram-blood-pressure',
      containerWidth: 600,
      containerHeight: 400,
      margin: { top: 25, right: 20, bottom: 50, left: 50 },
  }, csvData, d => d.percent_high_blood_pressure, 'Percent High Blood Pressure (%)');

  bloodPressureHistogram.updateVis();

  const geoDataElderly = JSON.parse(JSON.stringify(geoData));
  const geoDataBloodPressure = JSON.parse(JSON.stringify(geoData));


  geoDataElderly.objects.counties.geometries.forEach(d => {
      for (let i = 0; i < csvData.length; i++) {
          if (d.id === csvData[i].cnty_fips) {
              d.properties.pop = +csvData[i].elderly_percentage;
          }
      }
  });

  geoDataBloodPressure.objects.counties.geometries.forEach(d => {
      for (let i = 0; i < csvData.length; i++) {
          if (d.id === csvData[i].cnty_fips) {
              d.properties.pop = +csvData[i].percent_high_blood_pressure;
          }
      }
  });

// For the elderly percentage map
const elderlyMap = new ChoroplethMap({
  parentElement: '#map-elderly',
  containerWidth: 500,
  containerHeight: 500,
  margin: { top: 10, right: 10, bottom: 10, left: 10 },
}, geoDataElderly); 

// For the high blood pressure map
const bloodPressureMap = new ChoroplethMap({
  parentElement: '#map-blood-pressure',
  containerWidth: 500,
  containerHeight: 500,
  margin: { top: 10, right: 10, bottom: 10, left: 10 },
}, geoDataBloodPressure); 

}).catch(error => console.error(error));
