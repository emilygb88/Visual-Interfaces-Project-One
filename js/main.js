/**
 * Load data from CSV file asynchronously
 */
let data;
d3.csv('data/national_health_data.csv')
  .then(_data => {
    data = _data;
    data.forEach(d => {
        d.elderly_percentage = +d.elderly_percentage;
        d.percent_high_blood_pressure = +d.percent_high_blood_pressure;
      });   
     
      scatterplot = new Scatterplot({ parentElement: '#scatterplot'}, data);
      scatterplot.updateVis();
      // histogram = new Histogram({ parentElement: '#histogram'}, data);

      // histogram = new Histogram({
      //   parentElement: '#histogram', // Specify the parent element where the histogram will be rendered
      //   containerWidth: 600, // Set the width of the container for the histogram
      //   containerHeight: 400, // Set the height of the container for the histogram
      //   margin: {top: 50, right: 50, bottom: 50, left: 50} // Set the margin for the histogram
      // }, data);
  
      // // Call the updateVis method to render the histogram
      // histogram.updateVis();

      const elderlyPercentageHistogram = new Histogram({
        parentElement: '#histogram-elderly',
        containerWidth: 600,
        containerHeight: 400,
        margin: { top: 25, right: 20, bottom: 50, left: 50 },
      }, data, d => d.elderly_percentage, 'Elderly Percentage (%)');
      
      elderlyPercentageHistogram.updateVis();
      
      const bloodPressureHistogram = new Histogram({
        parentElement: '#histogram-blood-pressure',
        containerWidth: 600,
        containerHeight: 400,
        margin: { top: 25, right: 20, bottom: 50, left: 50 },
      }, data, d => d.percent_high_blood_pressure, 'Percent High Blood Pressure (%)');

      bloodPressureHistogram.updateVis();
      
    })
    .catch(error => console.error(error));



    // Create an instance of the Histogram class
// const histogram = new Histogram({
//   parentElement: '#histogram',
//   containerWidth: 600,
//   containerHeight: 400,
//   margin: {top: 25, right: 20, bottom: 50, left: 50},
//   tooltipPadding: 15
// }, []);

// /**
//  * Load data from CSV file asynchronously
//  */
// let data;
// d3.csv('data/national_health_data.csv')
//   .then(_data => {
//     data = _data;
//     data.forEach(d => {
//         d.elderly_percentage = +d.elderly_percentage;
//         d.percent_high_blood_pressure = +d.percent_high_blood_pressure;
//       });
//     // Call updateVis() only after data is loaded
//     if (data) {
//       histogram.updateVis();
//       console.log("Data loaded successfully:", data); // Add this line to log data

//     } 
//   })
//   .catch(error => console.error(error));
