var map = L.map('map').setView([38, -95], 4);

// basemap (Carto Light)
var basemapUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
var basemap =  L.tileLayer(basemapUrl, {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

// ----------------- WEATHER LAYER -----------------
var weatherLayer = L.layerGroup();

// add radar into weather layer
var radarUrl = 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi';
var radarDisplayOptions = {
  layers: 'nexrad-n0r-900913',
  format: 'image/png',
  transparent: true
};

var radar = L.tileLayer.wms(radarUrl, radarDisplayOptions);
radar.addTo(weatherLayer);

// add alerts into weather layer
var weatherAlertsUrl = 'https://api.weather.gov/alerts/active?region_type=land';
$.getJSON(weatherAlertsUrl, function(data) {
    L.geoJSON(data, {
        style: function(feature){
            var alertColor = 'orange';
            if (feature.properties.severity === 'Extreme') alertColor = 'purple';
            if (feature.properties.severity === 'Severe')  alertColor = 'red';
            if (feature.properties.severity === 'Minor')   alertColor = 'yellow';
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup(feature.properties.headline);
        }
    }).addTo(weatherLayer);
});

// ----------------- EARTHQUAKE LAYER -----------------
var earthquakeLayer = L.layerGroup();
var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// color + size functions for earthquakes
function getColor(mag) {
  return mag >= 5 ? '#d73027' :
         mag >= 4 ? '#fc8d59' :
         mag >= 3 ? '#fee08b' :
         mag >= 2 ? '#d9ef8b' :
         mag >= 1 ? '#91cf60' :
                    '#1a9850';
}
function getRadius(mag) {
  return mag === 0 ? 2 : mag * 3;
}

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
  }).addTo(earthquakeLayer);
});

// ----------------- LAYER CONTROL -----------------
var overlays = {
    "Weather (Radar + Alerts)": weatherLayer,
    "Earthquakes (USGS)": earthquakeLayer
};
L.control.layers(null, overlays, { collapsed: false }).addTo(map);

// default layer = Weather
weatherLayer.addTo(map);
