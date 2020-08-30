// Add console.log to check to see if our code is working.
console.log("working");

// We create the streets tile layer that will be the background of our map.
let streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/{z}/{x}/{y}?access_token={accessToken}', {
attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

// We create the satellite view tile layer that will be an option for our map.
let satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/{z}/{x}/{y}?access_token={accessToken}', {
attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

// We create the dark view tile layer that will be an option for our map.
let dark = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token={accessToken}', {
attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

// Create a base layer that holds all three maps.
let baseMaps = {
	"Streets": streets,
  	"Satellite": satelliteStreets,
  	"Dark": dark
};

// Create the earthquake and tectonic layer for our map.
let earthquakes = new L.layerGroup();
let tectonics = new L.layerGroup();


// We define an object that contains the overlays.
// This overlay will be visible when the box is checked.
let overlays = {
	Earthquakes: earthquakes,
	Tectonics: tectonics
  };

// Create the map object with center, zoom level and default layer.
let map = L.map('mapid', {
	center: [0,0],
	zoom: 3,
	layers: [streets]
})

// Pass our map layers into our layers control and add the layers control to the map.
L.control.layers(baseMaps, overlays).addTo(map);


//---------------------------------------------
// adding earthquake data from GeoJSON using onEachFeature
//---------------------------------------------

// location of our GeoJSON file
let earthquakeData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// This function returns the style data for each of the earthquakes we plot on
// the map. We pass the magnitude of the earthquake into a function to calculate the radius.
function styleInfo(feature) {
	return {
	  opacity: 1,
	  fillOpacity: 1,
	  fillColor: getColor(feature.properties.mag),
	  color: "#000000",
	  radius: getRadius(feature.properties.mag),
	  stroke: true,
	  weight: 0.5
	};
  };

// This function determines the radius of the earthquake marker based on its magnitude.
// Earthquakes with a magnitude of 0 will be plotted with a radius of 1.
function getRadius(magnitude) {
	if (magnitude === 0) {
	  return 1;
	}
	return magnitude * 4;
  }

// This function determines the color of the earthquake marker based on its magnitude.
function getColor(magnitude) {
	if (magnitude > 5) {
	  return "#ea2c2c";
	}
	if (magnitude > 4) {
	  return "#ea822c";
	}
	if (magnitude > 3) {
	  return "#ee9c00";
	}
	if (magnitude > 2) {
	  return "#eecc00";
	}
	if (magnitude > 1) {
	  return "#d4ee00";
	}
	return "#98ee00";
  }


// Map the earthquake data
d3.json(earthquakeData).then(function(data) {
	L.geoJson(data, {
		pointToLayer: function(feature, latlng){
			console.log(data);
			return L.circleMarker(latlng).bindPopup("<h2> Magnitude:" + feature.properties.mag + "</h2> <hr>");
		},
	style: styleInfo,
	onEachFeature: function(feature, layer) {
		layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
	  }
	}).addTo(earthquakes);
	earthquakes.addTo(map);
});

//---------------------------------------------
// adding earthquake data from GeoJSON using onEachFeature
//---------------------------------------------

// location of our GeoJSON file
let tectonicData = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

let myStyle = {
	color: "#0000FF",
	fillColor: "#89bace",
	weight: 3
  };

// Map the tectonic data
d3.json(tectonicData).then(function(data) {
    console.log(data);
  // Creating a GeoJSON layer with the retrieved data.
  	L.geoJson(data, {
      style: myStyle,
		onEachFeature: function(feature, layer) {
		console.log(layer);
		//layer.bindPopup("<h2> Neighborhood:" + feature.properties.AREA_NAME + "</h2> <hr>");
		}
	}).addTo(tectonics);
	tectonics.addTo(map);
});

//---------------------------------------------
// adding legend for the earthquake data
//---------------------------------------------

// Add legend
var legend = L.control({
	position: 'bottomright'
});

legend.onAdd = function () {
	let div = L.DomUtil.create('div', 'info legend');

	const magnitudes = [0, 1, 2, 3, 4, 5]
	const colors = [
		"#98ee00",
		"#d4ee00",
		"#eecc00",
		"#ee9c00",
		"#ea822c",
		"#ea2c2c"
	];


    // Looping through our intervals to generate a label with a colored square for each interval.
   for (var i = 0; i < magnitudes.length; i++) {
	console.log(colors[i]);
	div.innerHTML +=
	  "<i style='background: " + colors[i] + "'></i> " +
	  magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
 }
  return div;
};

legend.addTo(map);


