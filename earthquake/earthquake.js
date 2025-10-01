// initialize the map
var map = L.map('map').setView([20, 0], 2);

// basemap (Carto Light)
var basemapUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
var basemap =  L.tileLayer(basemapUrl, {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

// function to color markers by magnitude
function getColor(mag) {
  return mag >= 5 ? '#d73027' :
         mag >= 4 ? '#fc8d59' :
         mag >= 3 ? '#fee08b' :
         mag >= 2 ? '#d9ef8b' :
         mag >= 1 ? '#91cf60' :
                    '#1a9850';
}

// function to size markers by magnitude
function getRadius(mag) {
  return mag === 0 ? 2 : mag * 3;
}

// load USGS earthquake GeoJSON
var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

$.getJSON(earthquakeUrl, function(data) {
  L.geoJSON(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, {
        radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
      });
    },
    onEachFeature: function(feature, layer) {
      var time = new Date(feature.properties.time);
      layer.bindPopup(
        "<b>Magnitude:</b> " + feature.properties.mag + "<br>" +
        "<b>Location:</b> " + feature.properties.place + "<br>" +
        "<b>Time:</b> " + time.toLocaleString()
      );
    }
  }).addTo(map);
});

// add legend
var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'legend'),
      mags = [0, 1, 2, 3, 4, 5],
      labels = [];

  div.innerHTML += "<h4>Magnitude</h4>";
  for (var i = 0; i < mags.length; i++) {
    div.innerHTML +=
      '<i style="background:' + getColor(mags[i] + 1) + '"></i> ' +
      mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
  }
  return div;
};
legend.addTo(map);
