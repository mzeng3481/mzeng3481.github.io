document.addEventListener("DOMContentLoaded", function () {
  const width = 700;
  const height = 500;
  const margin = { top: 20, right: 50, bottom: 30, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const parseData = (d) => ({
      year: parseInt(d.year),
      value: parseFloat(d.value),
  });

  function createLineChart(targetDiv, dataPath, lineColor) {
      const svg = d3.select(targetDiv)
          .append("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

      d3.csv(dataPath, (data) => {
          const parsedData = data.map(parseData);

          const xScale = d3.scaleLinear()
              .domain(d3.extent(parsedData, (d) => d.year))
              .range([0, innerWidth]);

          const yScale = d3.scaleLinear()
              .domain([0, d3.max(parsedData, (d) => d.value)])
              .range([innerHeight, 0]);

          const lineGenerator = d3.line()
              .x((d) => xScale(d.year))
              .y((d) => yScale(d.value));

          const line = svg.append("path")
              .datum(parsedData)
              .attr("fill", "none")
              .attr("stroke", lineColor)
              .attr("stroke-width", 2)
              .attr("d", lineGenerator);

          svg.append("g")
              .attr("transform", `translate(0, ${innerHeight})`)
              .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

          svg.append("g").call(d3.axisLeft(yScale));
      });
  }

  function updateLineChart(sliderValue, targetDiv, dataPath, lineColor) {
      d3.csv(dataPath, (data) => {
          const parsedData = data.map(parseData);

          const xScale = d3.scaleLinear()
              .domain(d3.extent(parsedData, (d) => d.year + parseInt(sliderValue)))
              .range([0, innerWidth]);

          const yScale = d3.scaleLinear()
              .domain([0, d3.max(parsedData, (d) => d.value)])
              .range([innerHeight, 0]);

          const lineGenerator = d3.line()
              .x((d) => xScale(d.year))
              .y((d) => yScale(d.value));

          const svg = d3.select(targetDiv).select("svg g");

          svg.select("path")
              .datum(parsedData)
              .transition()
              .duration(20)
              .attr("d", lineGenerator);

          svg.select(".y-axis")
              .call(d3.axisLeft(yScale));

          svg.select(".x-axis")
              .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
      });
  }

  document.getElementById("slider1").addEventListener("input", function () {
      updateLineChart(this.value, "#slide1", "data/US_Blood.csv", "red");
  });

  document.getElementById("slider2").addEventListener("input", function () {
      updateLineChart(this.value, "#slide2", "data/US_Blood.csv", "red");
  });

  createLineChart("#slide1", "data/US_Blood.csv", "red");

  function drawMap(targetDiv, countryCode) {
    // Define margins and dimensions for the chart
    var margin = { top: 20, right: 50, bottom: 30, left: 50 };
    var width = 700 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
  
    // Create an SVG element for the chart
    var svg2 = d3.select(targetDiv)
      .html("") // Clear any existing content in the target div
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    // Construct the paths for the data files based on the selected countryCode
    var bloodDataPath = "data/" + countryCode + "_Blood.csv";
    var crimeDataPath = "data/" + countryCode + "_Crime.csv";
  
    // Load the CSV data for blood and crime
    d3.csv(bloodDataPath, function (bloodData) {
      d3.csv(crimeDataPath, function (crimeData) {
        // Parse the loaded data to the appropriate format
        const parsedBloodData = bloodData.map((d) => ({
          year: parseInt(d.year),
          value: parseFloat(d.BLL),
        }));
  
        const parsedCrimeData = crimeData.map((d) => ({
          year: parseInt(d.year),
          value: parseFloat(d.crime),
        }));
  
        // Create scales for x and y axes
        var xScale = d3.scaleLinear()
          .domain([d3.min(parsedBloodData, (d) => d.year), d3.max(parsedCrimeData, (d) => d.year)])
          .range([0, width]);
  
        var yScaleBlood = d3.scaleLinear()
          .domain([0, d3.max(parsedBloodData, (d) => d.value)])
          .range([height, 0]);
  
        var yScaleCrime = d3.scaleLinear()
          .domain([0, d3.max(parsedCrimeData, (d) => d.value)])
          .range([height, 0]);
  
        // Define line functions for blood and crime data
        var lineBlood = d3.line()
          .x((d) => xScale(d.year))
          .y((d) => yScaleBlood(d.value));
  
        var lineCrime = d3.line()
          .defined((d) => d.year >= 1960 && d.year <= 2014) // Only include data within the range
          .x((d) => xScale(d.year))
          .y((d) => yScaleCrime(d.value));
  
        // Draw the line for blood data
        var Line = svg2.append("path")
          .datum(parsedBloodData)
          .attr("fill", "none")
          .attr("stroke", "red")
          .attr("stroke-width", 2)
          .attr("d", lineBlood);
  
        // Draw the line for crime data
        svg2.append("path")
          .datum(parsedCrimeData)
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-width", 2)
          .attr("d", lineCrime);
  
        // Add x and y axes for blood data
        svg2.append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
  
        svg2.append("g").call(d3.axisLeft(yScaleBlood));
        svg2.append("g")
          .attr("transform", `translate(${width}, 0)`)
          .call(d3.axisRight(yScaleCrime));
  
  
        function updateChart(sliderValue) {
          var lineBlood = d3.line()
            .x((d) => xScale(d.year + parseInt(sliderValue)))
            .y((d) => yScaleBlood(d.value));
          Line
            .datum(parsedBloodData)
            .transition()
            .duration(20)
            .attr("d", lineBlood);
        }
        //listen for slider update
        d3.select("#slider2").on("input", function (d) {
          selectedValue = this.value
          updateChart(selectedValue)
        });
      });
    });
  }
});
