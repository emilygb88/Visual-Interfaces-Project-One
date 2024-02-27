let scatterplot, histogram1, histogram2, elderlyMap, bloodPressureMap;

const attributeLabels = {
    poverty_perc: 'Poverty Percentage (%)',
    median_household_income: 'Median Household Income ($)',
    education_less_than_high_school_percent: 'Education Less Than High School Percentage (%)',
    air_quality: 'Air Quality',
    park_access: 'Number of Parks',  // Check this
    percent_inactive: 'Percent Inactive (%)',
    percent_smoking: 'Percent Smoking (%)',
    urban_rural_status: 'Urban Rural Status', // Not number!
    elderly_percentage: 'Elderly Percentage (%)',
    number_of_hospitals: 'Number of Hospitals',
    number_of_primary_care_physicians: 'Number of Primary Care Physicians',
    percent_no_heath_insurance: 'Percent No Health Insurance (%)',
    percent_high_blood_pressure: 'Percent High Blood Pressure (%)',
    percent_coronary_heart_disease: 'Percent Coronary Heart Disease (%)',
    percent_stroke: 'Percent Stroke (%)',
    percent_high_cholesterol: 'Percent High Cholesterol (%)',
    
};

// Function to initialize all visualizations
function initVisualizations(csvData, geoData) {
    // Initialize scatterplot
    scatterplot = new Scatterplot({ 
        parentElement: '#scatterplot', 
        containerWidth: 500,
        containerHeight: 300,
        margin: {top: 25, right: 20, bottom: 50, left: 90}, }, csvData);
    

    // Initialize histograms
    histogram1 = new Histogram({
        parentElement: '#histogram-elderly',
        containerWidth: 500,
        containerHeight: 300,
        margin: {top: 25, right: 20, bottom: 50, left: 100}, 
    }, csvData, d => d.elderly_percentage, 'Elderly Percentage (%)');

    histogram2 = new Histogram({
        parentElement: '#histogram-blood-pressure',
        containerWidth: 500,
        containerHeight: 300,
        margin: {top: 25, right: 20, bottom: 50, left: 90}, 
    }, csvData, d => d.percent_high_blood_pressure, 'Percent High Blood Pressure (%)');

    // Initialize choropleth maps
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

    elderlyMap = new ChoroplethMap({
        parentElement: '#map-elderly',
        margin: { top: 10, right: 10, bottom: 10, left: 10 },
    }, geoDataElderly);

    bloodPressureMap = new ChoroplethMap({
        parentElement: '#map-blood-pressure',
        margin: { top: 10, right: 10, bottom: 10, left: 10 },
    }, geoDataBloodPressure);

    d3.select('#xAttributeSelector').on('change', function() {
        const selectedXAttribute = d3.select(this).property('value');
        updateVisualizations(selectedXAttribute, d3.select('#yAttributeSelector').property('value'));
    });
    
    d3.select('#yAttributeSelector').on('change', function() {
        const selectedYAttribute = d3.select(this).property('value');
        updateVisualizations(d3.select('#xAttributeSelector').property('value'), selectedYAttribute);
    });
}


// Load CSV and JSON data
Promise.all([
    d3.csv('data/national_health_data.csv'),
    d3.json('data/counties-10m.json')
]).then(data => {
    const csvData = data[0];
    const geoData = data[1];

    // Parse CSV data
    csvData.forEach(d => {
        d.poverty_perc = +d.poverty_perc;
        d.median_household_income = +d.median_household_income;
        d.education_less_than_high_school_percent = +d.education_less_than_high_school_percent;
        d.air_quality = +d.air_quality;
        d.park_access = +d.park_access;
        d.percent_inactive = +d.percent_inactive;
        d.percent_smoking = +d.percent_smoking;
        d.urban_rural_status = +d.urban_rural_status;
        d.elderly_percentage = +d.elderly_percentage;
        d.number_of_hospitals = +d.number_of_hospitals;
        d.number_of_primary_care_physicians = +d.number_of_primary_care_physicians;
        d.percent_no_heath_insurance = +d.percent_no_heath_insurance;
        d.percent_high_blood_pressure = +d.percent_high_blood_pressure;
        d.percent_coronary_heart_disease = +d.percent_coronary_heart_disease;
        d.percent_stroke = +d.percent_stroke;
        d.percent_high_cholesterol = +d.percent_high_cholesterol;

    });

    // Initialize visualizations
    initVisualizations(csvData, geoData);

    // Assuming `attributes` is an array containing the attribute names in your dataset
    const attributes = [
        'poverty_perc',
        'median_household_income',
        'education_less_than_high_school_percent',
        'air_quality',
        'park_access',
        'percent_inactive',
        'percent_smoking',
        'urban_rural_status',
        'elderly_percentage',
        'number_of_hospitals',
        'number_of_primary_care_physicians',
        'percent_no_heath_insurance',
        'percent_high_blood_pressure',
        'percent_coronary_heart_disease',
        'percent_stroke',
        'percent_high_cholesterol'
      ];

    // Populate dropdown menus with options
    const xDropdown = d3.select('#xAttributeSelector');
    const yDropdown = d3.select('#yAttributeSelector');

    xDropdown.selectAll('option')
        .data(attributes)
        .enter()
        .append('option')
        .attr('value', d => d)
        .text(d => d);

    yDropdown.selectAll('option')
        .data(attributes)
        .enter()
        .append('option')
        .attr('value', d => d)
        .text(d => d);
}).catch(error => console.error(error));

// Function to update all visualizations based on selected attributes
function updateVisualizations(selectedAttribute1, selectedAttribute2) {
    const selectedAttribute1Label = attributeLabels[selectedAttribute1];
    const selectedAttribute2Label = attributeLabels[selectedAttribute2];

    // Update scatterplot
    scatterplot.updateVis(selectedAttribute1, selectedAttribute2, selectedAttribute1Label, selectedAttribute2Label);

    // Update histograms
    histogram1.updateVis(d => d[selectedAttribute1], selectedAttribute1Label);
    histogram2.updateVis(d => d[selectedAttribute2], selectedAttribute2Label);

    // Update choropleth maps
    elderlyMap.updateVis(selectedAttribute1);
    bloodPressureMap.updateVis(selectedAttribute2);
}
