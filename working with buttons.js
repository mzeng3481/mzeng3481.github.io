let drawAll = (locationId, country) => {
    Promise.all([
        d3.csv("data/US_Blood.csv"),
        d3.csv("data/US_Crime.csv"),
        d3.csv("data/Brit_Blood.csv"),
        d3.csv("data/Brit_Crime.csv"),
        d3.csv("data/Canada_Blood.csv"),
        d3.csv("data/Canada_Crime.csv"),
        d3.csv("data/Aus_Blood.csv"),
        d3.csv("data/Aus_Crime.csv"),
    ]).then(([usBloodData, usCrimeData, britBloodData, britCrimeData, canadaBloodData, canadaCrimeData, ausBloodData, ausCrimeData]) => {
        // Draw the 4 graphs using drawLineChart function
        if(country === "US") {
          drawLineChart(usBloodData, usCrimeData, locationId, true); // Draw US_Blood.csv and US_Crime.csv
        } else if (country === "brit") {
          drawLineChart(britBloodData, britCrimeData, locationId, false); // Draw Brit_Blood.csv and Brit_Crime.csv
        } else if (country === "canada") {
          drawLineChart(canadaBloodData, canadaCrimeData, locationId, false); // Draw Canada_Blood.csv and Canada_Crime.csv
        } else if (country === "aus") {
          drawLineChart(ausBloodData, ausCrimeData, locationId, false); // Draw US_Blood.csv and US_Crime.csv with add20 true
        }

    });
};


let drawLineChart = (bloodData, crimeData, locationId, add20) => {
    d3.select(locationId).select("svg").remove();
    // Set up the dimensions for the chart
    const margin = { top: 20, right: 50, bottom: 30, left: 50 };
    const width = 700 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
  
    // Create the SVG element
    // const svg = d3.select(locationId)
    // .append("svg")
    // .attr("viewBox", viewWindow)
    // .attr("preserveAspectRatio", "xMinYMin meet")
    // .attr("height", "100%")
    // .attr("width", "100%");
  
    const svg = d3
    .select(locationId)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Convert the data to the appropriate format for US_Blood.csv
    const parsedBloodData = bloodData.map((d) => ({
      year: parseInt(d.year),
      value: parseFloat(d.BLL),
    }));
  
    // Convert the data to the appropriate format for US_Crime.csv
    const parsedCrimeData = crimeData.map((d) => ({
      year: parseInt(d.year),
      value: parseFloat(d.crime),
    }));
  
    // Define the scales for x and y axes
    const xScale = d3.scaleLinear().domain([1936, 2014]).range([0, width]);
  
    const yScaleBlood = d3.scaleLinear().domain([0, d3.max(parsedBloodData, (d) => d.value)]).range([height, 0]);
  
    const yScaleCrime = d3.scaleLinear().domain([0, d3.max(parsedCrimeData, (d) => d.value)]).range([height, 0]);
    console.log(yScaleCrime)
    // Define the line generators
    const lineBlood = d3
      .line()
      .x((d) => xScale(add20 ? d.year + 23 : d.year)) // Add 20 years to each data point if add20 is true
      .y((d) => yScaleBlood(d.value));

    const lineCrime = d3
      .line()
      .defined((d) => d.year >= 1960 && d.year <= 2014) // Only include data within the range
      .x((d) => xScale(d.year))
      .y((d) => yScaleCrime(d.value));
  
    // Create the path for the line chart for US_Blood.csv
    svg
      .append("path")
      .datum(parsedBloodData)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("d", lineBlood);
  
    // Create the path for the line chart for US_Crime.csv
    svg
      .append("path")
      .datum(parsedCrimeData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", lineCrime);
  
    // Add x and y axes
    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(xScale));
  
    svg.append("g").call(d3.axisLeft(yScaleBlood));
  
    // Add a second y-axis for US_Crime.csv data
    svg.append("g").attr("transform", `translate(${width}, 0)`).call(d3.axisRight(yScaleCrime));
  };
  
  let drawLine = (locationId, add20) => {
    Promise.all([
      d3.csv("data/US_Blood.csv"),
      d3.csv("data/US_Crime.csv"),
    ]).then(([bloodData, crimeData]) => {
      // Call the function to draw the line chart
      drawLineChart(bloodData, crimeData, locationId, add20);
    });
  };