// Chart functions

// wrapper function
(function () {

  // frame size
  var width = 300, height = 350;

  // color generator, 2 colors for ped/bike
  var colorScale = d3.scaleOrdinal().domain(["Pedestrian", "Bicyclist"])
    .range(["#d9a78b", "#a65e44"]);

  // create an svg element in the chart div
  var svg = d3.select(".chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
  
  // variables for the pie chart dimensions  
  var pieTranslate = "translate(150, 180)";
  var pieInnerRadius = 0;
  var pieOuterRadius = 100;

  // hold the csv accident data
  var csvData;

  // expressed metro to start the app
  //var expressed = "Reno Metropolitan"

  window.onload = setMap();

  // function to create a pie chart, starting with all CA-NV Pedestrian & Bicyclists
  function setChart(metroPedBike) {


    // pie generator - moves from details to data array, no sorting
    var data = d3.pie()
      .sort(null)
      .value(function (d) {
        return d.value;
      })(metroPedBike);
    //console.log(metroPedBike);

    // arc generator - 
    var segments = d3.arc()
      .innerRadius(pieInnerRadius)
      .outerRadius(pieOuterRadius)
      //.padAngle(0.05)
      .padRadius(50);

    // appends the segments to the frame using data
    var sections = svg.append("g")
      .attr("transform", pieTranslate)
      .attr("class", "piechart")
      .selectAll("path")
      .data(data);

    sections.enter()
      .append("path")
      .attr("d", segments)
      .attr("class", "piesegment")
      .attr("fill", function (d) {
        return colorScale(d.data.name);
      });

    // labels (number) at centroid of each segment (pie slice)
    var content = d3.select("g")
      .selectAll("text")
      .data(data);

    content.enter()
      .append("text")
      .classed("inside", true)
      .each(function (d) {
        var center = segments.centroid(d);
        d3.select(this)
          .attr("x", center[0] - 10)
          .attr("y", center[1])
          .text(d.data.value)
      })

    // legend
    var legends = svg.append("g")
      // makes this appear in upper left of chart
      .attr("transform", "translate(5, 0)")
      .selectAll(".legends")
      .data(data);

    var legend = legends.enter()
      .append("g")
      .classed("legends", true)
      .attr("transform", function (d, i) {
        return "translate(0," + (i + 1) * 30 + ")";
      });

    // legend patches
    legend.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", function (d) {
        return colorScale(d.data.name);
      });

    // legend labels
    legend.append("text")
      .classed("label", true)
      .text(function (d) {
        return d.data.name;
      })
      .attr("x", 25)
      .attr("y", 15);



      

  } // end setChart()

  // function to create a dropdown menu for attribute selection
  function createDropdown(metroAccidents, metroList) {
    // add select element

    //console.log(metroList);

    var dropdown = d3.select(".chart")
      .append("select")
      .attr("class", "dropdown")
      .on("change", function () {
        changeAttribute(this.value, metroAccidents)

      });

    // add initial option
    var titleOption = dropdown.append("option")
      .attr("class", "titleOption")
      .attr("disabled", "true")
      .text("Select Metro Area");

    // add attribute name options
    var attrOptions = dropdown.selectAll("attrOptions")
      .data(metroList)
      .enter()
      .append("option")
      .attr("value", function (d) {
        return d;
      })
      .text(function (d) {
        var metroNameIndex = metroList.findIndex(item => item === d);
        return metroList[metroNameIndex];
      });
   

  }; // end createDropdown()

  // function to change the metro area displayed in the chart
  function changeAttribute(metroName, metroAccidents) {

    // get the accidents from the selected metro area, then summarize on PERSONS, HARM_EV
    var metroSubset = metroAccidents.get(metroName);
    var metroSubsetSum = d3.rollup(metroSubset, v => d3.sum(v, d => d.PERSONS), d => d.HARM_EV)
    var metroSubsetSumArray = Array.from(metroSubsetSum, ([name, value]) => ({ name, value }));
    //console.log("metroSubsetSumArray", metroSubsetSumArray);
    //console.log(metroName, metroSubset.length);

    // transition on pie chart - does this do anything?
    var sections = d3.selectAll(".piesegment")
      .transition()
      .delay(function (d, i) {
        return i * 20;
      })
      .duration(500);

    updateChart(sections, metroSubsetSumArray)

    // update chart title
    var currentMetroTitle = document.currentMetro;
    currentMetroTitle.innerHTML(metroName);


  } // end changeAttribute()

  // function to update the current pie chart with the selected Metro area
  function updateChart(sections, metroPedBike) {

    // pie generator
    var data = d3.pie()
      .sort(null)
      .value(function (d) {
        return d.value;
      })(metroPedBike);

    // remove the existing pie segments
    var oldSections = d3.selectAll(".piechart");
    oldSections.remove();

    // now add the new segments
    // arc generator - 
    var segments = d3.arc()
      .innerRadius(pieInnerRadius)
      .outerRadius(pieOuterRadius)
      //.padAngle(0.05)
      .padRadius(50);

    // appends the segments to the frame using data
    var sections = svg.append("g")
      .attr("transform", pieTranslate)
      .attr("class", "piechart")
      .selectAll("path")
      .data(data);

    sections.enter()
      .append("path")
      .attr("d", segments)
      .attr("class", "piesegment")
      .attr("fill", function (d) {
        return colorScale(d.data.name);
      });

    // remove old labels
    var oldInside = d3.selectAll(".inside")
    oldInside.remove();

    // labels (number) at centroid of each segment (pie slice)
    var content = d3.select(".piechart")
      .selectAll("text")
      .data(data);

    content.enter()
      .append("text")
      .classed("inside", true)
      .each(function (d) {
        var center = segments.centroid(d);
        d3.select(this)
          .attr("x", center[0] - 10)
          .attr("y", center[1])
          .text(d.data.value)
      })



  }; // end updateChart()

  // read the csv data of accidents
  function setMap() {

    // load the csv data
    var promises = [];
    promises.push(d3.csv("data/Accidents_Merge_metro2.csv", d3.autoType)); // d3.autoType reads in the input from d3.csv and tries to figure out the data type, converting numeric strings to numbers 
    Promise.all(promises).then(callback);

    // callback function
    function callback(data) {
      csvData = data[0];

      // groups all the accident records by their metro area
      var metroAccidents = d3.group(csvData, d => d.metro);
      //console.log(metroAccidents);
      //console.log(d3.flatRollup(csvData, v => d3.sum(v, d => d.PERSONS), d => d.metro, d => d.HARM_EV));

      var allMetroAccidentsSum = d3.rollup(csvData, v => d3.sum(v, d => d.PERSONS), d => d.HARM_EV);
      //console.log("allMetroAccidentsSum: ", allMetroAccidentsSum);
      var allMetroAccidentsSumArray = Array.from(allMetroAccidentsSum, ([name, value]) => ({ name, value }));
      //console.log("allMetroAccidentsArray: ", allMetroAccidentsSumArray);

      var metroList = Array.from(metroAccidents, ([key]) => (key));
      //console.log("MetroList: ", metroList);

      //var metroSubset = metroAccidents.get(expressed);
      //var metroSubsetSum = d3.rollup(metroSubset, v => d3.sum(v, d => d.PERSONS), d => d.HARM_EV)
      //var metroSubsetSumArray = Array.from(metroSubsetSum, ([name, value]) => ({ name, value }));
      //console.log("metroSubsetSumArray: ", metroSubsetSumArray);

      // call dropdown function
      createDropdown(metroAccidents, metroList)

      // create the 1st chart
      setChart(allMetroAccidentsSumArray);

    }; // end callback()

  }; // end setMap()

})(); // end of wrapper function
