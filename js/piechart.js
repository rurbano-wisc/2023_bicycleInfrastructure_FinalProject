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
  .attr("class", "barchartframe")
  .attr("transform", `translate(${10},${barChartMargin})`)
  .attr("width", barChartWidth + barChartMargin * 2 )
  .attr("height", barChartHeight + barChartMargin * 2);

  const scatterChartSvg = d3.select(".scatterChart")
  .append("svg")
  .attr("class", "scatterChartFrame")
  .attr("transform", `translate(${barChartMargin},${barChartMargin})`)
  .attr("width", barChartWidth + barChartMargin * 2 )
  .attr("height", barChartHeight + (barChartMargin * 2) + 30); //with room for a title
  //.attr("background-color", "purple");

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
        
    // Get the selected location's coordinates from the metroAccidents dataset
    var selectedMetroIndex = metroList.findIndex(item => item === this.value);
    var selectedMetro = metroAccidents[selectedMetroIndex];
    var center = [selectedMetro.Longitude, selectedMetro.Latitude];
    var zoom = 10; // Change this to adjust the zoom level

    // Zoom to the selected location on the map
    map.flyTo({
      center: center,
      zoom: zoom,
      essential: true // This option ensures that the zoom animation is always shown
    });
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

    // filter the metro yearly sum dataset by the current metro
    var metroYearSumDataSubset = csvMetroYearSumData.filter(function (metro) {
      return metro.metro == metroName;
    });
    //console.log("metroMetroYearSumDataSubset: ", metroYearSumDataSubset)

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
    promises.push(d3.csv("data/Metro_commuters_accidents.csv", d3.autoType));
    Promise.all(promises).then(callback);

    // callback function
    function callback(data) {
      csvData = data[0];
      csvMetroYearSumData = data[1];
      //console.log("csvMetroYearSumData: ", csvMetroYearSumData);
      csvYearSumData = data[2];
      //console.log("csvYearSumData: ", csvYearSumData);
      csvMetroCommutersAccidents = data[3];
      //console.log("csvMetroCommutersAccidents ", csvMetroCommutersAccidents);

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

      setScatterChart(csvMetroCommutersAccidents);

    }; // end callback()

  }; // end setMap()

// function to create a stacked bar chart, based on https://observablehq.com/@stuartathompson/a-step-by-step-guide-to-the-d3-v4-stacked-bar-chart
// creates the initial stacked bar chart with all CA-NV data
  function setBarChart(csvYearSumData) {
    // categories for the bar chart
    keys = ["Pedestrian", "Bicyclist"];

    // stack the 2 categories
    stack = d3.stack().keys(keys)(csvYearSumData);
    //console.log("stack: ", stack);

    stack.map((d, i) => {
      d.map(d => {
        d.key = keys[i];
        return d;
      })
      return d;
    });

    // get the maximum value for the y axis
    yMax = d3.max(csvYearSumData, d => {
      var val = 0
      for (var k of keys) {
        val += d[k];

      }
      return val;
    });
    //console.log("yMax: ", yMax);

    //get x and y scales
    var y = d3.scaleLinear().domain([0, yMax]).range([barChartHeight, 0]);
    var x = d3.scaleLinear().domain([2001, 2020]).range([0, barChartWidth])

    // y axis generator
    var yAxis = d3.axisLeft(y);

    // append rectangles from the stack
    barChartSvg.selectAll("g")
      .data(stack).enter()
      .append("g")
      .attr("class", function (d) {
        return d.key + "BarGroup"
      })
      .selectAll("rect")
      .data(d => d).enter()
      .append("rect")
      .attr("class", function (d) {
        return d.key + "Bar"
      })
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

    // add the y axis
    var yAxisSvg = barChartSvg.append("g")
      .call(yAxis)
      .attr("class", "barChartYaxis")
      .attr("transform", "translate(35,0)")

    // format the Y axis
    yAxisSvg.selectAll(".tick text")
      .attr("fill", "black");
    yAxisSvg.selectAll(".tick line")
      .attr("stroke", "black");

    // add the X axis
    makeXaxis();

    // not sure what this does
    return barChartSvg.node();

  }; // end setBarChart()

  function updateBarChart(metroYearSumDataSubset, metroName) {
    // categories for the bar chart
    keys = ["Pedestrian", "Bicyclist"];

    // stack the 2 categories
    stack = d3.stack().keys(keys)(metroYearSumDataSubset);
    //console.log("stack: ", stack);

    stack.map((d, i) => {
      d.map(d => {
        d.key = keys[i];
        return d;
      })
      return d;
    });

    // get the maximum value for the y axis
    yMax = d3.max(metroYearSumDataSubset, d => {
      var val = 0
      for (var k of keys) {
        val += d[k];
      }
      
      // if ymax is less than 11, make the y axis scale 10 so that it doesn't make a scale with fractions. 
      if (val <= 10) {
        return 10;
      } else {      
        return val;
      };

    });
    //console.log("yMax: ", yMax);

    //get x and y scales
    var y = d3.scaleLinear().domain([0, yMax]).range([barChartHeight, 0]);
    var x = d3.scaleLinear().domain([2001, 2020]).range([0, barChartWidth]);

    // y axis generator
    var yAxis = d3.axisLeft(y);

    // remove the existing g elements so they can be replaced with the new metro bars    
    var removeElement = document.querySelector(".PedestrianBarGroup");
    removeElement.remove();
    var removeElement = document.querySelector(".BicyclistBarGroup");
    removeElement.remove();
    var removeElement = document.querySelector(".barChartYaxis");
    removeElement.remove();
    var removeElement = document.querySelector(".barChartXaxis");
    removeElement.remove();

    // append rectangles from the stack
    barChartSvg.selectAll("g")
      .data(stack).enter()
      .append("g")
      .attr("class", function (d) {
        return d.key + "BarGroup"
      })
      .selectAll("rect")
      .data(d => d).enter()
      .append("rect")
      .attr("class", function (d) {
        return d.key + "Bar"
      })
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

    // add the y axis
    var yAxisSvg = barChartSvg.append("g")
      .call(yAxis)
      .attr("class", "barChartYaxis")
      .attr("transform", "translate(35,0)")
    //.attr("rotate", -90);
    //.attr("fill", "black");

    // format the Y axis
    yAxisSvg.selectAll(".tick text")
      .attr("fill", "black");
    yAxisSvg.selectAll(".tick line")
      .attr("stroke", "black");

    // add the X axis
    makeXaxis();

    // not sure what this does
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

function setScatterChart(csvMetroCommutersAccidents) {
 
  //console.log("barChartWidth", barChartWidth);
  //console.log(csvMetroCommutersAccidents);
  //console.log("metroNameNoSpace: " + metroNameNoSpace(csvMetroCommutersAccidents[0].metro) )


  const xScale = d3.scaleLinear()
    .domain([0, 13])
    .range([20, barChartWidth]);

  const yScale = d3.scaleLinear()
    .domain([0, 50])
    .range([barChartHeight, 0])

  //var colorScale4Scatter = makeColorScale(csvMetroCommutersAccidents)
  // color wasn't meaningful in this context

  var radiusScale = d3.scaleLinear()
    .domain([8000, 8600000])
    .range([3, 36])


  const metroGroup = scatterChartSvg.selectAll(".metroCircle")
    .data(csvMetroCommutersAccidents)
    .enter()
    .append("g")
    .attr("class", function (d) {
      return "circleMetro " + metroNameNoSpace(d.metro);
       })
    .attr("transform", function (d) {
      return "translate(" + xScale(d.PctCycWalkWorkers) + "," + yScale(d.DeathsPer100k) + ")"
    })
    .append('circle')
    //.attr("class", "metroCircle")
    .attr("r", function (d) { return radiusScale(d.population) })
    .attr("transform", "translate(" + (barChartMargin) + "," + barChartMargin + ")")
    .style("fill", "#a65e44")
    // .style("fill", function (d) {
    //   return colorScale4Scatter(d.deaths2workers);
    //  })
    .style("opacity", 0.5)

    .on("mouseover", function (event, d) {
      //console.log("d.metro", d.metro);
      //console.log("d.properties ", d.properties);
      highlight(d);
      
    })
    .on("mouseout", function (event, d) {
        dehighlight(d);
    })
    .on("mousemove", moveLabel);


   var desc = metroGroup.append("desc")
   .text('{"stroke": "#000", "stroke-width": "0px"}');

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  const xAxisGroup = scatterChartSvg.append("g")
    .attr("class", "scatterChartXaxis")
    .attr("transform", "translate(" + (barChartMargin) + "," + (barChartMargin + 200) + ")")
    .call(xAxis);

  const yAxisGroup = scatterChartSvg.append("g")
    .attr("class", "scatterChartYaxis")
    .attr("transform", "translate(" + (barChartMargin + 20) + "," + barChartMargin + ")")
    .call(yAxis);

  d3.select(".scatterChartFrame")
    .append("text")
    .text("Percent of workers who commute by walking or biking")
    .attr("class", "scatterChartXaxisLabel")
    .attr("x", 60)
    .attr("y", 270)

  d3.select(".scatterChartFrame")
    .append("text")
    .text("Deaths per 100,000 people")
    .attr("class", "scatterChartYaxisLabel")
    .attr("x", 12)
    .attr("y", 60)

  d3.select(".scatterChartFrame")
    .append("text")
    .text("Circle size represents population")
    .attr("class", "scatterChartNote")
    .attr("x", 150)
    .attr("y", 220)

}; // end setScatterChart()

    // function to create color scale generator for the scatter chart
    function makeColorScale(data) {
      var colorClasses = ['#fef0d9','#fdcc8a','#fc8d59','#e34a33','#b30000']; // ColorBrewer.org yellow-red

      // create color scale generator
      var colorScale = d3.scaleThreshold()
          .range(colorClasses);

      //build an arrray of all values of the expressed attribute
      var domainArray = [];
      for (var i = 0; i < data.length; i++) {
          var val = (data[i].deaths2workers);
          //console.log("val " + val);
          domainArray.push(val);
      };

      //console.log(domainArray);

      // cluster data using ckmeans clustering algorithm to create natural breaks
      var clusters = ss.ckmeans(domainArray, 5);
      // reset domain array to cluster minimums
      domainArray = clusters.map(function (d) {
          return d3.min(d);
      });

      //console.log(clusters);

      // remove first value from domain array to create class breakpoints
      domainArray.shift();

      // assign array of last 4 cluster minimums as domain
      colorScale.domain(domainArray);

      //console.log(domainArray)

      return colorScale;
  }; // end makeColorScale()

// function to highlight enumeration units and bars
function highlight(props) {
  // change stroke

  var metroName = metroNameNoSpace(props.metro);
  //console.log(metroName);

  var selected = d3.selectAll("." + metroName)
      .style("stroke", "yellow")
      .style("stroke-width", "2");
      
  setLabel(props);

}; // end highlight()

function dehighlight(props) {

  var metroName = metroNameNoSpace(props.metro);

  var selected = d3.selectAll("." + metroName)
      .style("stroke", function () {
          return getStyle(this, "stroke");
      })
      .style("stroke-width", function () {
          return getStyle(this, "stroke-width");
      });

      // var selected = d3.selectAll(".counties" + countyName)
      // .style("stroke", function () {
      //     return getStyle(this, "stroke");
      // })
      // .style("stroke-width", function () {
      //     return getStyle(this, "stroke-width");
      // });

      d3.select(".infolabel") // remove the floating label
      .remove();

} // end dehighlight()

function getStyle(element, styleName) {
  var styleText = d3.select(element)
      .select("desc")
      .text();

  var styleObject = JSON.parse(styleText);
  //console.log(styleObject);

  return styleObject[styleName];
}; // end getStyle()

function setLabel(props) {
  // label content
  var labelAttribute = props.metro;
   //Math.round(props[expressed] * 10) / 10 + "%<b>  " + props.County + "</b>";

  var metroNameWithoutSpace = metroNameNoSpace(props.metro);

  //create info label div
  var infolabel = d3.select("#scatterChartDiv")
      .append("div")
      .attr("class", "infolabel")
      .attr("id", metroNameWithoutSpace + "_label")
      .html(labelAttribute)
      .style("opacity", 1);

  var metroName = infolabel.append("div")
      .attr("class", "labelname")
      .html(props.metro);
}; // end setLabel();

function moveLabel() {
  // use coordinates of mousemove event to set label coordinates

  // get width of label
  var labelWidth = d3.select(".infolabel")
      .node()
      .getBoundingClientRect()
      .width;

  // use coordinates of mousemove event to set label coordinates

  var x1 = event.clientX + 10,
      y1 = event.clientY - 75,
      x2 = event.clientX - labelWidth - 10,
      y2 = event.clientY + 25;

  // horizontal label coordinate, testing for overflow
  var x = event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1;

  // vertical label coordinate, testing for overflow
  var y = event.clientY < 75 ? y2 : y1;

  d3.select(".infolabel")
      .style("left", x + "px")
      .style("top", y + "px");
}; // end moveLabel()


    // function to strip spaces from metro names    
    function metroNameNoSpace(metroNameWithSpace) {
      var metroName = metroNameWithSpace.replace(/\s+/g, '');
      return metroName;
  } // end metroNameNoSpace()

})(); // end of wrapper function
