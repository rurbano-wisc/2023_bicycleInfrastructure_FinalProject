// wrapper function
(function () {

    // declare map var in global scope
    var map;
    // basemaps
    var darkOutdoors = L.tileLayer('https://api.mapbox.com/styles/v1/rurbano/clat71or5000314qyg1hvzhpd/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoicnVyYmFubyIsImEiOiJjbGFoanRxYWkwY3c5M3dta2RhdzNlYXppIn0.HebbeRpuABArQDdvwTJhEQ', {
        attribution: '&copy; <a href="https://www.mapbox.com/contribute/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    var lightOutdoors = L.tileLayer('https://api.mapbox.com/styles/v1/rurbano/clgzoea5q006001q16z8387p5/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoicnVyYmFubyIsImEiOiJjbGFoanRxYWkwY3c5M3dta2RhdzNlYXppIn0.HebbeRpuABArQDdvwTJhEQ', {
        attribution: '&copy; <a href="https://www.mapbox.com/contribute/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    // additional tile layer
    var cyclistTracts = L.tileLayer('https://api.mapbox.com/v4/rurbano.de80xrgq/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicnVyYmFubyIsImEiOiJjaXc4ZWkycDkwMDF4Mm5wN3lwbmllMndnIn0.8W8epv1aXygbmFbjmG0yPw', {
        attribution: 'Cyclist Tracts &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
    });

    // control layer for the legend control
    var controlLayers = L.control.layers();

    // function to initiate Leaflet map
    function createMap() {
        // create the map, centered on CA/NV
        map = L.map('map', {
            center: [37.49, -119.5],
            zoom: 5.5,
            minZoom: 5,
            maxZoom: 22 // limit the zoom levels to something appropriate for this dataset, where the basemap shows the city names
        });
        //add darkOutdoors Mapbox base tile layer as default
        darkOutdoors.addTo(map);
        // call the function to process the metro area boundaries polygon layer
        getMetroAreaBoundaryData();
        controlLayers.addTo(map);
        //console.log(cityMetrosNev);
        // add a base layer control to the map - has to be individually with the .addBaseLayer() method, not as a group object
        controlLayers.addBaseLayer(darkOutdoors, "Dark Outdoors base map");
        controlLayers.addBaseLayer(lightOutdoors, "Light Outdoors base map");

        
    mapboxgl.accessToken = 'pk.eyJ1IjoicnVyYmFubyIsImEiOiJjbGFoanRxYWkwY3c5M3dta2RhdzNlYXppIn0.HebbeRpuABArQDdvwTJhEQ';
    var map = new mapboxgl.Map({
        container: 'map',
        center: [-74.5, 40], // longitude, latitude
        zoom: 9,
        style: 'mapbox://styles/mapbox/streets-v11'
    });


    map.on('load', function() {
        map.addLayer({
            id: 'rurbano.de80xrgq',
            type: 'fill',
            source: {
                type: 'vector',
                url: 'mapbox://rurbano.de80xrgq'
            },
            'source-layer': 'TractsMerge-09s8y2',
            paint: {
                'fill-color': '#f2f2f2'
            }
        });
    });
        

        map.on('zoomend', function () {
            if (map.getZoom() < 8) {
                map.removeLayer(cityMetrosNev);//1st geoJSON layer
                map.removeLayer(cityMetrosCal);
            } else {
                map.addLayer(cityMetrosNev);
                cityMetrosNev.bringToBack();
                map.addLayer(cityMetrosCal);
                cityMetrosCal.bringToBack();
            }
        });
    }; // end createMap()

    //function to import the metro area boundary data and OSM geojson, style it, and add it to the layer control
    function getMetroAreaBoundaryData() {
        // style for metro Area boundaries
        var metroAreaBoundaryStyle = {
            //fillColor: "#A65E44",
            color: "#1e90ff", //dodger blue :)
            weight: 1,
            opacity: 1,
            fillOpacity: 0,
            dashArray: "2 2"
        };
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
    }; // end getMetroAreaBoundaryData()
    
    document.addEventListener('DOMContentLoaded', createMap);

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

//if needed for something else
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
// function pointToLayer(feature, latlng, attributes) {

//     var attribute = attributes[0];
//     //create variable from feature attribute
//     var harmEv = feature.properties.HARM_EVN;
//     //create variables for the values
//     var isPedestrian = harmEv === "Pedestrian";
//     var isCyclist = harmEv === "Cyclist";

//     // style for brown circle
//     var geoJsonMarkerOptions = {
//         radius: 6,
//         fillColor: isPedestrian ? "#FF4136" : // red for pedestrian
//         isCyclist ? "#0074D9" : // blue for cyclist
//         "#A65E44", // default brown color
//         color: "#fff",
//         weight: 1,
//         opacity: 1,
//         fillOpacity: 0.8
//     };

//     //step 5, for each feature, determine its value for the selected attribute
//     //var attValue = Number(feature.properties[attribute]);

//     // step 6, give each feature's circle marker a radius based on its attribute value
//     //geoJsonMarkerOptions.radius = calcPropRadius(attValue);

//     //create circle marker layer
//     var layer = L.circleMarker(latlng, geoJsonMarkerOptions);

//     //build popup content string
//     var popupContent = new PopupContent(feature.properties, attribute);

//     //bind the popup to the circle marker
//     layer.bindPopup(popupContent.formatted, {
//         offset: new L.Point(0, -geoJsonMarkerOptions.radius)
//     });

//     //return the circle marker to the L.geoJson pointToLayer option
//     return layer;
// }; // end pointToLayer




// function to create a PopupContent class
function PopupContent(properties, attribute) {
    this.properties = properties;
    this.attribute = attribute;

    this.formatted = "<p><b>Year: " + this.properties.YEAR + "</b></p><p>Persons " + this.properties.PERSONS + "</b><h4>Fatalities " + this.properties.FATALS + "</h4></p>";
}; // end PopupContent

})(); // end of wrapper function
