/* --- Dataset URLs --- */

// USA Albers County Geographic Data 
let countyURL = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json"

// NY Times Rolling Average Local Data Before [Dec 12, 2020]
let covidBeforeURL = "data/us_covid_data_before.csv"

// NY Times Rolling Average Local Data After [July 26, 2021]
let covidAfterURL = "data/us_covid_data_after.csv"

// CDC Vaccination Data [July 26, 2021]
let vaccinationURL = "data/vaccination_data.csv"

/* -------------------- */

// Initialize variables to hold respective data 
let countyData
let covidDataBefore
let vaccinationData
let covidDataAfter

// Select SVG canvas and initialize attributes
var canvas

//   .classed("svg-content", true);

// let canvas = d3.select("#canvas")

// Select tooltip
let tooltip = d3.select("#tooltip")

// Color Range
var color
var title
// color = d3.scaleQuantize([0, 200], d3.schemeReds[5])
covidCasesColorScale = d3.scaleThreshold([0, 15, 37, 70, 167, 179], d3.schemeReds[6])
covidDeathsColorScale = d3.scaleThreshold([0, 0.4, 1.2, 2.8, 5.5, 7.0], d3.schemeOranges[6])
vaccineGreenColorScale = d3.scaleQuantize([0, 60], d3.schemeGreens[4])
vaccineBlueColorScale = d3.scaleQuantize([0, 60], d3.schemeBlues[4])


/*
* drawMap(): displays COVID maps for cases, deaths, and vaccinations.
* @param bool displayCovidCases: if true, draw covid cases map, else draw vaccine map
* @param bool displayDefaultOption: if true, draw covid cases map OR 2 dose vaccine percentage map (depending on displayCovidCases value),
*                                   else, draw covid deaths map OR 1 dose vaccine percentage map (depending on displayCovidCases value)
* @param bool displayBeforeData: if true, draw covid maps for Dec 12, 2020, else draw covid maps for July 26, 2021
* @param string locationId: the name of the html id in which the map is to be placed
*/
let drawMap = (displayCovidCases, displayDefaultOption, displayBefore, locationId) => {

    // Clear previous content
    d3.select(locationId).select("svg").remove();

    // Select appropriate location to draw map
    canvas = d3.select(locationId)
    .append("svg")
    .attr("viewBox", "-80 -60 1100 800")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("height", "100%")
    .attr("width", "100%");

  
    // Draw county borders
    canvas.selectAll("path")
        .data(topojson.feature(countyData, countyData.objects.counties).features)
        .enter()
        .append("path")
        .attr("d", d3.geoPath())
        .attr("class", "county")
        .attr("z-index", "2")
        .attr("fill", (countyDataItem) => {

            // Attain County FIPS code
            let countyId = countyDataItem["id"]
            let county
            let dataset

            /* Determine appropriate dataset:
            * 1)  vaccinationData
            * 2) covidDataBefore
            * 3) covidDataAfter
            */
            dataset = covidDataBefore


            // Find matching FIPS Code in COVID dataset
            county = dataset.find((educationDataItem) => {
                return (educationDataItem["fips"] == countyId)
            })
            
            // Display County Array
            // console.log("County Array:")
            // console.log(county)
            // console.log("")

            // If true, display COVID map, else display vaccination map
            if(displayCovidCases) {

                // If true, display COVID Cases map, else display COVID deaths map
                if(displayDefaultOption) {

                    // Select fill color based on covid cases
                    try {
                        
                        color = covidCasesColorScale
                        title = "Average Cases Per 100k"
                        let cases_avg_per_100k = county["cases_avg_per_100k"]
                        return color(cases_avg_per_100k)
                    }
                    catch {
                        return "rgb(230, 230, 230)"
                    }
                }

                // Else display COVID deaths map
                else {

                    // Select fill color based on covid deaths
                    try {
                        color = covidDeathsColorScale
                        title = "Average Deaths Per 100k"
                        let deaths_avg_per_100k = county["deaths_avg_per_100k"]
                        return color(deaths_avg_per_100k)
                    }
                    catch {
                        return "rgb(230, 230, 230)"
                    }
                }
            }
        })

        // //border between counties
        // .attr("stroke", "white")
        // .attr("stroke-width", "0.75px")
        // .attr("opacity", "0.85")
        // .attr("z-index", "2")

        .on("mouseover", (countyDataItem) => {
            
            tooltip.transition().duration(0)
                .style("visibility", "visible")
            
            let countyId = countyDataItem["id"]
            let county
            let dataset

            /* Determine appropriate dataset:
            * 1)  vaccinationData
            * 2) covidDataBefore
            * 3) covidDataAfter
            */
            dataset = covidDataBefore


            // Find matching FIPS Code in COVID dataset
            county = dataset.find((educationDataItem) => {
                return (educationDataItem["fips"] == countyId)
            })

            if(displayCovidCases) {
                // Add tooltip information
                tooltip.select("#tooltip-header").text(county["county"] + " County "/* + county["state"]*/)
                tooltip.select("#tooltip-date").text(county["date"])
                tooltip.select("#cases").text("Cases: " + county["cases"])
                tooltip.select("#cases-avg").text("Avg Cases: " + county["cases_avg"])
                tooltip.select("#cases-avg-per-100k").text("Avg Cases Per 100k: " + county["cases_avg_per_100k"])
            }
            else {
                // Add tooltip information

                tooltip.select("#tooltip-header").text(county["Recip_County"])
                tooltip.select("#tooltip-date").text(county["date"])
                tooltip.select("#cases").text("Fully Vaccinated: " + county["Series_Complete_Pop_Pct"] + "%")
                tooltip.select("#cases-avg").text("# Fully Vaccinated: " + county["Series_Complete_Yes"])
                tooltip.select("#cases-avg-per-100k").text("Fully Vaccinated Ages 12+: " + county["Series_Complete_12PlusPop_Pct"]+ "%")
            }
        })
        //hide mouseover when cursor not over map
        .on("mouseout", (countyDataItem) => {
            tooltip.transition().duration(0)
                .style("visibility", "hidden")
        })
        //make mouseover move to where cursor is
        .on('mousemove', function() {
            d3.select('#tooltip').style('left', (d3.event.pageX+15) + 'px').style('top', (d3.event.pageY+15) + 'px')
            })

    // Add legend
    canvas.append("g")
        .attr("transform", "translate(-80,-50)");      

    // Add annonations
    var annotations = [
        {
          note: {
            label: "Basic settings with subject position(x,y) and a note offset(dx, dy)",
            title: "d3.annotationLabel"
          },
          x: 50,
          y: 150,
          dy: 137,
          dx: 162
        },{
          note: {
            label: "Added connector end 'arrow', note wrap '180', and note align 'left'",
            title: "d3.annotationLabel",
            wrap: 150,
            align: "left"
          },
          connector: {
            end: "dot" // 'dot' also available
          },
          x: 200,
          y: 200,
          dy: 137,
          dx: 162
        },{
          //below in makeAnnotations has type set to d3.annotationLabel
          //you can add this type value below to override that default
          type: d3.annotationCalloutCircle,
          note: {
            label: "States such as Indiana faced increasing cases due to relaxed restrictions on COVID-19 protocols.",
            title: "Midwest Serge",
            wrap: 190
          },
          //settings for the subject, in this case the circle radius
          subject: {
            radius: 55
          },
          x: 670,
          y: 270,
          dy: 150,
          dx: 150
        },{
            //below in makeAnnotations has type set to d3.annotationLabel
            //you can add this type value below to override that default
            type: d3.annotationCalloutCircle,
            note: {
              label: "Populated cities such as L.A, Chicago, and New York all experienced skyrocketing COVID cases.",
              title: "Populated Cities",
              wrap: 190
            },
            //settings for the subject, in this case the circle radius
            subject: {
              radius: 55
            },
            x: 150,
            y: 360,
            dy: 55,
            dx: -55
          },{
            note: {
              label: "On Dec 12, 2020, the U.S was in full lockdown as health officials struggled to flatten the curve.",
              title: "Full Lockdown",
              wrap: 150
            },
            connector: {
              end: "dot"
              // type: "curve",
              //can also add a curve type, e.g. curve: d3.curveStep
              // points: [[100, -100],[150, -250]]
            },
            x: 425,
            y: 300,
            dy: -220,
            dx: 275
          }].map(function(d)
        { 
            d.color = "navy"; 
            return d
        })

        if(displayDefaultOption) {

            // Remove first 2 annotations
            annotations.splice(0, 2);
        }
        else {
            //ME: if annotations has length 6 and you want 2 annotations then remove the first 4, if you want 1 then remove the last 5
            //basically, remove all the ones you don't want and edit the remaining elements like below
            // Remove first 3 annotations
            annotations.splice(0, 3);

            // Annotated Circle
            annotations[0].note.label = "Iowa sees significant death rates compared to other states."
            annotations[0].note.title = "Death Rates"
            annotations[0].x = 545,
            annotations[0].y = 225,
            annotations[0].dy = -150,
            annotations[0].dx = 150

            // Dot annotation
            annotations[1].note.label = "Despite having a high survival rate, COVID-19 resulted in over half a million lives being lost."
            annotations[1].note.title = "The Cost"
            annotations[1].x = 342,
            annotations[1].y = 300,
            annotations[1].dy = 45,
            annotations[1].dx = -325
        }


    //renders annotations
    var makeAnnotations = d3.annotation()
        .type(d3.annotationLabel)
        .annotations(annotations)


    d3.select(locationId + " svg")
        .append("g")
        .attr("class", "annotation-group")
        .style("stroke-width", "2.5px")
        .attr("class", "animate__animated animate__fadeInRight animate__delay-1s")
        .call(makeAnnotations)

}

/* 
    Load External Data:
    1) County Geography Data
    2) US COVID-19 County 'Before' Data [Dec 12, 2020]
    3) US COVID-19 Vaccination Data [July 26, 2021]
    4) US COVID-19 County 'After' Data [July 26, 2021]
*/
d3.json(countyURL).then(
    (data, error) => {
        if(error) {
            console.log(log)
        }
        else {
            countyData = data

            d3.csv(covidBeforeURL).then(
                (data, error) => {
                    if(error) {
                        console.log(error)
                    }
                    else {
                        covidDataBefore = data

                        // console.log("COVID Data Before:")
                        // console.log(covidDataBefore)
                        // console.log("")
                        drawMap(true, true, true, "#slide1")
                    }
                }
            )
        }
    }
)
