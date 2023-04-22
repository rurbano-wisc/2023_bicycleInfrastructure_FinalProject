// wrapper function
(function () {

// declare map var in global scope
var map;


// basemap - bike paths and cycleways
var bikeBasemap = L.tileLayer('https://api.mapbox.com/styles/v1/geraldhestonwisc/clg1fo230000101mu9rnp9qr6/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZ2VyYWxkaGVzdG9ud2lzYyIsImEiOiJja3ludzB3d3kwN2EyMndyMDN3cGh4dXkwIn0.INriYzJUUk60r1ffeQBr9g', {
    attribution: '&copy; <a href="https://www.mapbox.com/contribute/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

// basemap - monochrome blue
var blueBasemap = L.tileLayer('https://api.mapbox.com/styles/v1/geraldhestonwisc/clevpwcbs000w01l49qtm5sk0/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZ2VyYWxkaGVzdG9ud2lzYyIsImEiOiJja3ludzB3d3kwN2EyMndyMDN3cGh4dXkwIn0.INriYzJUUk60r1ffeQBr9g', {
    attribution: '&copy; <a href="https://www.mapbox.com/contribute/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});


// control layer for the legend control
var controlLayers = L.control.layers();

// global var for the metro area boundaries layer, assigned in getMetroAreaBoundaryData();
var cityMetrosNev = L.geoJSON();
var cityMetrosCal = L.geoJSON();

// function to initiate Leaflet map
function createMap() {
    // create the map, centered on CA/NV
    map = L.map('map', {
        center: [37.5, -119.5], 
        zoom: 4,
        minZoom: 5,
        maxZoom: 22 // limit the zoom levels to something appropriate for this dataset, where the basemap shows the city names
    });

    // add bike Mapbox base tile layer
    bikeBasemap.addTo(map);

    // call the function to process the metro area boundaries polygon layer
    getMetroAreaBoundaryData();
    controlLayers.addTo(map);

    // // call getData function to process the point layer
    // getData();

    // add a base layer control to the map - has to be individually with the .addBaseLayer() method, not as a group object
    controlLayers.addBaseLayer(bikeBasemap, "Bicycle base map");
    controlLayers.addBaseLayer(blueBasemap, "Blue base map");

    map.on('zoomend', function () {
        if (map.getZoom() < 6) {
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


//function to import the metro area boundary data geojson, style it, and add it to the layer control
function getMetroAreaBoundaryData() {
    // style for metro Area boundaries
    var metroAreaBoundaryStyle = {
        //fillColor: "#A65E44",
        color: "#abe453", //random color - fix it later
        weight: 1,
        opacity: 1,
        fillOpacity: 0
    };

    // load the Nevada Metro Area boundary data
    fetch("data/CityMetros_Nev_geog.geojson")
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            cityMetrosNev = L.geoJSON(json, metroAreaBoundaryStyle)//.addTo(map); took this out so that it wouldn't be added to the map when it first loads, then it will turn on when the zoom reaches level 6

            // add the layer to the Layers control
            controlLayers.addOverlay(cityMetrosNev, 'Metro Area Boundaries NV');
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


})(); // end of wrapper function
