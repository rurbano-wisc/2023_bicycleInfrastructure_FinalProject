  function getMetroAreaBoundaryData() {
        // style for metro Area boundaries
        var metroAreaBoundaryStyle = {
            //fillColor: "#A65E44",
            color: "#abe453", //random color - fix it later
            weight: 1,
            opacity: 1,
            fillOpacity: 0
        };
		
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