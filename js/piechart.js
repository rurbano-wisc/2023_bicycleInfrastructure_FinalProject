// Chart functions

// wrapper function
(function () {

  // frame size
  var width = 410, height = 300;

  // color generator, 2 colors for ped/bike
  var colorScale = d3.scaleOrdinal()
    .domain(["Pedestrian", "Bicyclist"])
    .range(["#d9a78b", "#a65e44"]);

  // create an svg element in the chart div
  var svg = d3.select(".chart")
    .append("svg")
    .attr("class", "piechartframe")
    .attr("width", width)
    .attr("height", height);
  
  // variables for the pie chart dimensions  
  var pieTranslate = "translate(150, 180)";
  var pieInnerRadius = 0;
  var pieOuterRadius = 100;

  // variables for the bar chart
  const barChartMargin = 25;
  // adjust the height and width to remove the margin
  const barChartWidth = 400 - barChartMargin * 2;
  const barChartHeight = 200;
  // add the margin back into the SVG and create the SVG wrapper
  
  // append the bar chart svg
  const barChartSvg = d3.select(".chart")
  .append("svg")
  .attr("transform", `translate(${10},${barChartMargin})`)
  .attr("class", "barchartframe")
  .attr("width", barChartWidth + barChartMargin * 2 )
  .attr("height", barChartHeight + barChartMargin * 2);


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
  function createDropdown(metroAccidents, metroList, csvMetroYearSumData) {
    // add select element

    //console.log(metroList);

    var dropdown = d3.select(".chart")
      .append("select")
      .attr("class", "dropdown")
      .on("change", function () {
        changeAttribute(this.value, metroAccidents, csvMetroYearSumData)

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
  function changeAttribute(metroName, metroAccidents, csvMetroYearSumData) {

    // get the accidents from the selected metro area, then summarize on FATALS, HARM_EV
    var metroSubset = metroAccidents.get(metroName);
    var metroSubsetSum = d3.rollup(metroSubset, v => d3.sum(v, d => d.FATALS), d => d.HARM_EV)
    var metroSubsetSumArray = Array.from(metroSubsetSum, ([name, value]) => ({ name, value }));
    //console.log("metroSubsetSumArray", metroSubsetSumArray);
    //console.log(metroName, metroSubset.length);

    //console.log("csvMetroYearSumData: ", csvMetroYearSumData);
    var metroYearSumDataSubset = csvMetroYearSumData.filter(function (metro) {
      return metro.metro == metroName;
    });
    
    
    
    console.log("metroMetroYearSumDataSubset: ", metroYearSumDataSubset)




    // transition on pie chart - does this do anything?
    var sections = d3.selectAll(".piesegment")
      .transition()
      .delay(function (d, i) {
        return i * 20;
      })
      .duration(500);

    updateChart(sections, metroSubsetSumArray, metroName);
      updateBarChart(metroYearSumDataSubset, metroName);

    // update chart title
    var currentMetroTitle = document.getElementById("currentMetro");
    currentMetroTitle.remove()
    var replaceTitle = document.querySelector(".chart");
    replaceTitle.insertAdjacentHTML("afterbegin", '<h4 id="currentMetro">Fatalities in ' + metroName + "</h4>")
    
    //console.log("currentMEtro:", currentMetroTitle);


  } // end changeAttribute()

  // function to update the current pie chart with the selected Metro area
  function updateChart(sections, metroPedBike, metroName) {

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
    promises.push(d3.csv("data/Accidents_metro_year.csv", d3.autoType));
    promises.push(d3.csv("data/Accidents_year_sum.csv", d3.autoType));
    Promise.all(promises).then(callback);

    // callback function
    function callback(data) {
      csvData = data[0];
      csvMetroYearSumData = data[1];
      //console.log("csvMetroYearSumData: ", csvMetroYearSumData);
      csvYearSumData = data[2];
      //console.log("csvYearSumData: ", csvYearSumData);

      // groups all the accident records by their metro area
      var metroAccidents = d3.group(csvData, d => d.metro);
      //console.log(metroAccidents);
      //console.log(d3.flatRollup(csvData, v => d3.sum(v, d => d.FATALS), d => d.metro, d => d.HARM_EV));

      //for the pie chart
      var allMetroAccidentsSum = d3.rollup(csvData, v => d3.sum(v, d => d.FATALS), d => d.HARM_EV);
      //console.log("allMetroAccidentsSum: ", allMetroAccidentsSum);
      var allMetroAccidentsSumArray = Array.from(allMetroAccidentsSum, ([name, value]) => ({ name, value }));
      //console.log("allMetroAccidentsArray: ", allMetroAccidentsSumArray);

      var metroList = Array.from(metroAccidents, ([key]) => (key));
      //console.log("MetroList: ", metroList);

      //var metroSubset = metroAccidents.get(expressed);
      //var metroSubsetSum = d3.rollup(metroSubset, v => d3.sum(v, d => d.FATALS), d => d.HARM_EV)
      //var metroSubsetSumArray = Array.from(metroSubsetSum, ([name, value]) => ({ name, value }));
      //console.log("metroSubsetSumArray: ", metroSubsetSumArray);

      // for the bar chart
      // var allMetroAccidentsSumByYear = d3.flatRollup(csvMetroYearSummaryData, v => d3.sum(v, d => d.TOTAL), d => d.YEAR, d => d.HARM_EV);
      // console.log("allMetroAccidentsSumByYear: ", allMetroAccidentsSumByYear);
      // var allMetroAccidentsSumByYearArray = Array.from(allMetroAccidentsSumByYear, ([name, value]) => ({ name, value }));
      // console.log("allMetroAccidentsSumByArray: ", allMetroAccidentsSumByYearArray);


      // call dropdown function
      createDropdown(metroAccidents, metroList, csvMetroYearSumData);

      // create the 1st chart
      setChart(allMetroAccidentsSumArray);

      setBarChart(csvYearSumData);

    }; // end callback()

  }; // end setMap()

// function to create a stacked bar chart, based on https://observablehq.com/@stuartathompson/a-step-by-step-guide-to-the-d3-v4-stacked-bar-chart
  function setBarChart(csvYearSumData) {
    keys = ["Pedestrian", "Bicyclist"];

    stack = d3.stack().keys(keys)(csvYearSumData);

    console.log("stack: ", stack);

    stack.map((d, i) => {
      d.map(d => {
        d.key = keys[i];
        return d;
      })
      return d;
    });

    yMax = d3.max(csvYearSumData, d => {
      var val = 0
      for (var k of keys) {
        val += d[k];

      }
      return val;
    });

    //console.log("yMax: ", yMax);

    y = d3.scaleLinear().domain([0, yMax]).range([barChartHeight, 0]);

    var x = d3.scaleLinear().domain([2001, 2020]).range([0, barChartWidth])

    var yAxis = d3.axisLeft(y);
    

    // append some rectangles
    barChartSvg.selectAll("g")
      .data(stack).enter()
      .append("g")
      .attr("class", function (d) {
        return d.key + " bars"
      })
      .selectAll("rect")
      .data(d => d).enter()
      .append("rect")
      .attr("class", "bars")
      .attr("x", function (d, i) {
        var fraction = barChartWidth / 20;
        return 30 + (i * fraction) + ((fraction - 1) / 2);
    })
      .attr("width", barChartWidth / 20)
      .attr("height", d => {
        return y(d[0]) - y(d[1]);
      })
      .attr("y", d => y(d[1]))
      .attr("fill", function (d) {
        return colorScale(d.key);
      })
      .attr("opacity", 1)
      .attr("stroke", "white")
      .attr("stroke-width", 1)

    var yAxisSvg = barChartSvg.append("g")
      .call(yAxis)
      .attr("class", "barChartYaxis")
      .attr("transform", "translate(35,0)")
      //.attr("rotate", -90);
      //.attr("fill", "black");



      yAxisSvg.selectAll(".tick text")
      .attr("fill", "black");

      yAxisSvg.selectAll(".tick line")
      .attr("stroke", "black");

    makeXaxis();

    return barChartSvg.node();

    

  }; // end setBarChart()

  function updateBarChart(metroYearSumDataSubset, metroName) {
    keys = ["Pedestrian", "Bicyclist"];

    stack = d3.stack().keys(keys)(metroYearSumDataSubset);

    console.log("stack: ", stack);

    stack.map((d, i) => {
      d.map(d => {
        d.key = keys[i];
        return d;
      })
      return d;
    });

    yMax = d3.max(metroYearSumDataSubset, d => {
      var val = 0
      for (var k of keys) {
        val += d[k];

      }
      return val;
    });

    //console.log("yMax: ", yMax);

    y = d3.scaleLinear().domain([0, yMax]).range([barChartHeight, 0]);

    var x = d3.scaleLinear().domain([2001, 2020]).range([0, barChartWidth])

    var yAxis = d3.axisLeft(y);
    
    d3.select()

    // append some rectangles
    barChartSvg.selectAll("g")
      .data(stack).enter()
      .append("g")
      .selectAll("rect")
      .data(d => d).enter()
      .append("rect")
      .attr("class", "bars")
      .attr("x", function (d, i) {
        var fraction = barChartWidth / 20;
        return 30 + (i * fraction) + ((fraction - 1) / 2);
    })
      .attr("width", barChartWidth / 20)
      .attr("height", d => {
        return y(d[0]) - y(d[1]);
      })
      .attr("y", d => y(d[1]))
      .attr("fill", function (d) {
        return colorScale(d.key);
      })
      .attr("opacity", 1)
      .attr("stroke", "white")
      .attr("stroke-width", 1)

    var yAxisSvg = barChartSvg.append("g")
      .call(yAxis)
      .attr("class", "barChartYaxis")
      .attr("transform", "translate(35,0)")
      //.attr("rotate", -90);
      //.attr("fill", "black");



      yAxisSvg.selectAll(".tick text")
      .attr("fill", "black");

      yAxisSvg.selectAll(".tick line")
      .attr("stroke", "black");

    makeXaxis();

    return barChartSvg.node();

    

  }; // end updateBarChart()


  function makeXaxis() {
    //create a second svg element to hold the bar chart
    var xAxisSvg = d3.select(".barchartframe")
    .append("svg")
    .attr("width", barChartWidth + barChartMargin * 2 )
    .attr("height", barChartHeight + barChartMargin * 2)
    .attr("class", "barChartXaxis");
       
var xScale = d3.scaleBand()
    .domain(["2001", "2002", "2003","2004", "2005", "2006","2007", "2008", "2009", "2010", "2011", "2012", "2013","2014", "2015", "2016","2017", "2018", "2019", "2020"])
    .range([0, barChartWidth + 16 ]) // getting them centered on the bars
    .padding([0.8]);

    xAxisSvg.append("g")
    .attr("transform", "translate(30,200)")
    .attr("class", "barChartXaxisLabel")
    .call(d3.axisBottom(xScale));

    xAxisSvg.selectAll(".tick text")
    .attr("fill", "black")
    .attr("writing-mode", "vertical-lr");

    xAxisSvg.selectAll(".tick line")
    .attr("stroke", "black");





        // var yearXLabels = xAxis.selectAll(".yearXLabel")
        // //.data(csvYearSumData)
        // //.enter()
        // .append("text")
        // //.sort(function (a, b) {
        // //    return b["Pop2022"] - a["Pop2022"]
        // //})
        // .attr("class", "yearXLabel")
        // .attr("x", function (d, i) {
        //     var fraction = barChartWidth / 20;
        //     return (i * fraction) + ((fraction - 1) / 2);
        // })
        // .attr("y", 500)
        // .text(function (i) {
        //   for (let i = 2001; i < 2022; i++)
        //     return i;
        // });

} // end makeXaxis

})(); // end of wrapper function
