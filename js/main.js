// wrapper function
(function () {

    // declare map var in global scope
    var map;
    // var accidentsHeatmap;
    // basemap - light gray, with OSM bike paths
    var lightBasemap = L.tileLayer('https://api.mapbox.com/styles/v1/geraldhestonwisc/clg1fo230000101mu9rnp9qr6/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZ2VyYWxkaGVzdG9ud2lzYyIsImEiOiJja3ludzB3d3kwN2EyMndyMDN3cGh4dXkwIn0.INriYzJUUk60r1ffeQBr9g', {
        attribution: '&copy; <a href="https://www.mapbox.com/contribute/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    // basemap - dark gray, with OSM bike paths
    var darkBasemap = L.tileLayer('https://api.mapbox.com/styles/v1/geraldhestonwisc/clgpya8w0004301rb87gi7z2e/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZ2VyYWxkaGVzdG9ud2lzYyIsImEiOiJja3ludzB3d3kwN2EyMndyMDN3cGh4dXkwIn0.INriYzJUUk60r1ffeQBr9g', {
        attribution: '&copy; <a href="https://www.mapbox.com/contribute/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
 
    var lightOutdoors = L.tileLayer('https://api.mapbox.com/styles/rurbano/clgzoea5q006001q16z8387p5/wmts?access_token=pk.eyJ1IjoicnVyYmFubyIsImEiOiJjbGFoanRxYWkwY3c5M3dta2RhdzNlYXppIn0.HebbeRpuABArQDdvwTJhEQ', {
        attribution: '&copy; <a href="https://www.mapbox.com/contribute/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    var darkOutdoors = L.tileLayer('https://api.mapbox.com/styles/rurbano/clat71or5000314qyg1hvzhpd/wmts?access_token=pk.pk.eyJ1IjoicnVyYmFubyIsImEiOiJjbGFoanRxYWkwY3c5M3dta2RhdzNlYXppIn0.HebbeRpuABArQDdvwTJhEQ', {
        attribution: '&copy; <a href="https://www.mapbox.com/contribute/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    // control layer for the legend control
    var controlLayers = L.control.layers();

    // global var for the individual layers, assigned in getMetroAreaBoundaryData(); but they aren't getting assigned
    // var cityMetrosNev = L.geoJSON();
    // var cityMetrosCal = L.geoJSON();
    // var osm150ftCal = L.geoJSON();
    // var osm150ftNev = L.geoJSON();
    // var osmCal = L.geoJSON();
    // var osmNev = L.geoJSON();
    // var accidentsCal = L.geoJSON();
    // var accidentsNev = L.geoJSON();

    // put CA-NV layers into group layers (doesn't work? 'cuz the layers aren't being assigned to global variables)
    // var cityMetros = L.layerGroup([cityMetrosNev, cityMetrosCal]);
    // var osm150ft = L.layerGroup([osm150ftCal, osm150ftNev]);
    // var osm = L.layerGroup([osmCal, osmNev]);

    // var overlayLayers = {
    //     "Metros Areas": cityMetrosNev,
    //     "OSM 150ft": osm150ftNev,
    //     "OSM": osmNev
    // };


    // function to initiate Leaflet map
    function createMap() {
        // create the map, centered on CA/NV
        map = L.map('map', {
            center: [37.49, -119.5],
            zoom: 5.5,
            minZoom: 5,
            maxZoom: 22 // limit the zoom levels to something appropriate for this dataset, where the basemap shows the city names
        });

        // add light gray bike Mapbox base tile layer
        lightBasemap.addTo(map);

        // call the function to process the metro area boundaries polygon layer
        getMetroAreaBoundaryData();
        // getCycleTractsData();
        // getWalkTractsData();

        controlLayers.addTo(map);
        //console.log(cityMetrosNev);
        // // call getData function to process the point layer
        getData();

        // function getAccidentsHeatmapData() {
        //     // load the accidents data as a GeoJSON layer
        //     fetch("data/Accidents_California.geojson")
        //         .then(function (response) {
        //             return response.json();
        //         })
        //         .then(function (json) {
        //             // convert the GeoJSON layer to an array of latitudes and longitudes
        //             var latlngs = json.features.map(function (feature) {
        //                 return [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
        //             });
        //             // create a new heatmap layer using Leaflet.heat
        //             var accidentsHeatmap = L.heatLayer(latlngs, {
        //                 radius: 25,
        //                 blur: 15,
        //                 maxZoom: 22,
        //             });
        //             // add the heatmap layer to the Layers control
        //             controlLayers.addOverlay(accidentsHeatmap, 'Accidents Heatmap');
        //         });
        // }
        // getAccidentsHeatmapData();
        // // add a base layer control to the map - has to be individually with the .addBaseLayer() method, not as a group object
        controlLayers.addBaseLayer(lightBasemap, "Light gray base map");
        controlLayers.addBaseLayer(darkBasemap, "Dark gray base map");
        controlLayers.addBaseLayer(lightOutdoors, "Light Outdoors base map");
        controlLayers.addBaseLayer(darkOutdoors, "Dark Outdoors base map");

        map.on('zoomend', function () {
            if (map.getZoom() < 8) {
                map.removeLayer(cityMetrosNev);//1st geoJSON layer
                map.removeLayer(cityMetrosCal);
                //map.removeLayer(accidentsCal);
                //map.removeLayer(accidentsNev);
                 // add the heatmap layer when zoomed out
                // map.addLayer(accidentsHeatmap);
            } else {
                map.addLayer(cityMetrosNev);
                cityMetrosNev.bringToBack();
                map.addLayer(cityMetrosCal);
                cityMetrosCal.bringToBack();
                // remove the heatmap layer when zoomed in
                map.removeLayer(accidentsHeatmap)
                //map.addLayer(accidentsNev);
                //map.addLayer(accidentsCal);
            }
        });
    }; // end createMap()
    

    //function to import the metro area boundary data and OSM geojson, style it, and add it to the layer control
    function getMetroAreaBoundaryData() {
        // style for metro Area boundaries
        var metroAreaBoundaryStyle = {
            //fillColor: "#A65E44",
            color: "#abe453", //random color - fix it later
            weight: 1,
            opacity: 1,
            fillOpacity: 0
        };
        //need to edit to apply scale for values; make field to color value
        var osm150ftStyle = {
            //fillColor: "#A65E44",
            color: "red", //random color - fix it later
            weight: 1,
            opacity: 1,
            fillOpacity: 0
        };

        // var osmStyle = {
        //     //fillColor: "#A65E44",
        //     color: "orange", //random color - fix it later
        //     weight: 1,
        //     opacity: 1,
        //     fillOpacity: 0
        // };

        // var accidentStyle = {
        //     radius: 8,
        //     fillColor: "#ff7800",
        //     color: "#000",
        //     weight: 1,
        //     opacity: 1,
        //     fillOpacity: 0.8
        // };

        // metro data
        // load the Nevada Metro Area boundary data
        fetch("data/CityMetros_Nev_geog.geojson")
            .then(function (response) {
                return response.json();
            })
            .then(function (json) {
                cityMetrosNev = L.geoJSON(json, metroAreaBoundaryStyle)//.addTo(map); took this out so that it wouldn't be added to the map when it first loads, then it will turn on when the zoom reaches level 6

                // add the layer to the Layers control
                controlLayers.addOverlay(cityMetrosNev, 'Metro Area Boundaries NV'); // this only seems to work within the callback function
                //console.log(cityMetrosNev);
            });

        // load the California Metro Area boundary data
        fetch("data/CityMetros_Cal_geog.geojson")
            .then(function (response) {
                return response.json();
            })
            .then(function (json) {
                cityMetrosCal = L.geoJSON(json, metroAreaBoundaryStyle)//.addTo(map); took this out so that it wouldn't be added to the map when it first loads, then it will turn on when the zoom reaches level 6

                // add the layer to the Layers control
                controlLayers.addOverlay(cityMetrosCal, 'Metro Area Boundaries CA');
            });


        // // load the Tracts Nevada data
        // fetch("data/Tracts_Nevada.geojson")
        //     .then(function (response) {
        //         return response.json();
        //     })
        //     .then(function (json) {
        //         osm150ftNev = L.geoJSON(json, osm150ftStyle)//.addTo(map); took this out so that it wouldn't be added to the map when it first loads, then it will turn on when the zoom reaches level 6

        //         // add the layer to the Layers control
        //         controlLayers.addOverlay(osm150ftNev, 'Tracts Nevada');
        //     });


        // // load the Tracts California data
        // fetch("data/Tracts_California.geojson")
        //     .then(function (response) {
        //         return response.json();
        //     })
        //     .then(function (json) {
        //         osm150ftCal = L.geoJSON(json, osm150ftStyle)//.addTo(map); took this out so that it wouldn't be added to the map when it first loads, then it will turn on when the zoom reaches level 6

        //         // add the layer to the Layers control
        //        controlLayers.addOverlay(osm150ftCal, 'Tracts_California');
        //     });

        // // load the OSM Nevada data
        // fetch("data/OSM_Nevada.geojson")
        //     .then(function (response) {
        //         return response.json();
        //     })
        //     .then(function (json) {
        //         osmNev = L.geoJSON(json, osmStyle)//.addTo(map); took this out so that it wouldn't be added to the map when it first loads, then it will turn on when the zoom reaches level 6

        //         // add the layer to the Layers control
        //         controlLayers.addOverlay(osmNev, 'OSM NV');
        //     });


        // // load the OSM California data
        // fetch("data/OSM_California.geojson")
        //     .then(function (response) {
        //         return response.json();
        //     })
        //     .then(function (json) {
        //         osmCal = L.geoJSON(json, osmStyle)//.addTo(map); took this out so that it wouldn't be added to the map when it first loads, then it will turn on when the zoom reaches level 6

        //         // add the layer to the Layers control
        //         controlLayers.addOverlay(osmCal, 'OSM CA');
        //     });


    }; // end getMetroAreaBoundaryData()

    // function getWalkTractsData() {
    //     // create a style object for the tracts layer
    //     var walkTractsStyle = {
    //       color: "#abe453",
    //       weight: 1,
    //       opacity: 1,
    //       fillOpacity: 0.6
    //     };
      
    //     // create a function to determine the fill color of the tracts based on the WalkStat attribute
    //     function getWalkTractsFillColor(feature) {
    //       var walkStat = feature.properties.WalkStat;
    //       if (walkStat === "No walking commuters") {
    //         return "transparent";
    //       } else if (walkStat === "Less than 2%") {
    //         return "#FED98E";
    //       } else if (walkStat === "Greater than 2% less than 10%") {
    //         return "#FE9929";
    //       } else if (walkStat === "Greater than 10%") {
    //         return "#CC4C02";
    //       }
    //     }
      
    //     // load the walk tracts data
    //     fetch("data/walkTracts.geojson")
    //       .then(function(response) {
    //         return response.json();
    //       })
    //       .then(function(json) {
    //         walkTracts = L.geoJSON(json, {
    //           style: walkTractsStyle,
    //           fillColor: getWalkTractsFillColor
    //         }).addTo(map);
    //         // add the walk tracts layer to the Layers control
    //         controlLayers.addOverlay(walkTracts, 'Walk Tracts');
    //       });
    //   }
      
    //   function getCycleTractsData() {
    //     // create a style object for the tracts layer
    //     var cycleTractsStyle = {
    //       color: "#abe453",
    //       weight: 1,
    //       opacity: 1,
    //       fillOpacity: 0.6
    //     };
      
    //     // create a function to determine the fill color of the tracts based on the CyclistStat attribute
    //     function getCycleTractsFillColor(feature) {
    //       var cyclistStat = feature.properties.CyclistStat;
    //       if (cyclistStat === "No cyclist commuters") {
    //         return "transparent";
    //       } else if (cyclistStat === "Less than 1%") {
    //         return "#BDC9E1";
    //       } else if (cyclistStat === "Greater than 1% less than 5%") {
    //         return "#67A9CF";
    //       } else if (cyclistStat === "Greater than 5%") {
    //         return "#02818A";
    //       }
    //     }
      
    //     // load the cycle tracts data
    //     fetch("data/cycleTracts.geojson")
    //       .then(function(response) {
    //         return response.json();
    //       })
    //       .then(function(json) {
    //         cycleTracts = L.geoJSON(json, {
    //           style: cycleTractsStyle,
    //           fillColor: getCycleTractsFillColor
    //         }).addTo(map);
    //         // add the cycle tracts layer to the Layers control
    //         controlLayers.addOverlay(cycleTracts, 'Cycle Tracts');
    //       });
    //   }

    document.addEventListener('DOMContentLoaded', createMap);

// function to retrieve the data and place it on the map
function getData() {

    // load the Nevada accidents data
    fetch("data/Accidents_Nevada_EVN.geojson")
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            //create an attribute array - names of attributes
            var attributes = processData(json);
            // calculate the minimum value
 //           calcStats(json);

            // calculate the yearly stats
 //           calcYearlyStats(json);
            
            //call function to create proportional symbols
            //var accidentsLayerName = 'accidentsNev';
            createPropSymbols(json, attributes)
            //controlLayers.addOverlay(json, 'Accidents NV');
            //call function to create the proportional symbols
//            createSequenceControls(attributes);
            // call function to create the legend with text for the 1st year, 2016
//            createLegend(attributes[0]);
        });
            // load the California accidents data
    fetch("data/Accidents_California_EVN.geojson")
    .then(function (response) {
        return response.json();
    })
    .then(function (json) {
        //create an attribute array - names of attributes
        var attributes = processData(json);
        // calculate the minimum value
//           calcStats(json);

        // calculate the yearly stats
//           calcYearlyStats(json);
        //call function to create proportional symbols
        createPropSymbols(json, attributes)
        //controlLayers.addOverlay(json, 'Accidents NV');
        //call function to create the proportional symbols
//            createSequenceControls(attributes);
        // call function to create the legend with text for the 1st year, 2016
//            createLegend(attributes[0]);
    });
}; // end getData();

//build an attributes array from the data
function processData(data) {
    //empty array to hold attributes
    var attributes = [];

    //properties of the 1st feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties) {
        //only take attributes with population values
        //if (attribute.indexOf("Rate") > -1) {
            attributes.push(attribute);
        //};
    };

    return attributes;
}; // end processData

function createPropSymbols(data, attributes,) {
    // create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return pointToLayer(feature, latlng, attributes);
            
        }
    }).addTo(map);
    //controlLayers.addOverlay(data, 'Accidents NV');
    
}; // end createPropSymbols

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes) {
    // mapping average unemployment rate for each year

    var attribute = attributes[0];
    //create variable from feature attribute
    var harmEv = feature.properties.HARM_EVN;
    //create variables for the values
    var isPedestrian = harmEv === "Pedestrian";
    var isCyclist = harmEv === "Cyclist";

    // style for brown circle
    var geoJsonMarkerOptions = {
        radius: 6,
        fillColor: isPedestrian ? "#FF4136" : // red for pedestrian
        isCyclist ? "#0074D9" : // blue for cyclist
        "#A65E44", // default brown color
        color: "#fff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //step 5, for each feature, determine its value for the selected attribute
    //var attValue = Number(feature.properties[attribute]);

    // step 6, give each feature's circle marker a radius based on its attribute value
    //geoJsonMarkerOptions.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, geoJsonMarkerOptions);

    //build popup content string
    var popupContent = new PopupContent(feature.properties, attribute);

    //bind the popup to the circle marker
    layer.bindPopup(popupContent.formatted, {
        offset: new L.Point(0, -geoJsonMarkerOptions.radius)
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
}; // end pointToLayer




// function to create a PopupContent class
function PopupContent(properties, attribute) {
    this.properties = properties;
    this.attribute = attribute;
    //this.year = attribute.split("_")[1];
    //this.unemploymentRate = this.properties[attribute];
    this.formatted = "<p><b>Year: " + this.properties.YEAR + "</b></p><p>Persons " + this.properties.PERSONS + "</b><h4>Fatalities " + this.properties.FATALS + "</h4></p>";
}; // end PopupContent

})(); // end of wrapper function
