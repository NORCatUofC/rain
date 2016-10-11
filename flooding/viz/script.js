var map = L.map('map', {
  center: [41.88, -87.63],
  zoom: 10,
  minZoom: 9,
  maxZoom: 16,
  maxBounds: [[41.644335, -87.940267], [42.0231311, -87.524044]]
});

L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
  { attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>' }
).addTo(map);

var floodLayer = L.tileLayer("https://s3.amazonaws.com/chi-311-flooding/chi_311_flooding_tiles/{z}/{x}/{y}.png").addTo(map);
var basementFloodLayer = L.tileLayer("https://s3.amazonaws.com/chi-311-flooding/chi_311_flooding_basement_tiles/{z}/{x}/{y}.png");

function zipStyleFunc(feature) {
  return {color: '#bc1818', weight: 0.75, fillOpacity: 0.0};
}
function commStyleFunc(feature) {
  return {color: '#31890f', weight: 0.75, fillOpacity: 0.0};
}
function onEachFunc(feature, layer) {
  layer.bindPopup("<strong>Zip:</strong> " + feature.properties.zip);
}

var zipLayer = new L.geoJSON(null, {style: zipStyleFunc, onEachFeature: function(feature, layer) {
  layer.bindPopup("<strong>Zip:</strong> " + feature.properties.zip);
}});

var commLayer = new L.geoJSON(null, {style: commStyleFunc, onEachFeature: function(feature, layer) {
  layer.bindPopup("<strong>Community Area:</strong> " + feature.properties.comm_area);
}});

var heatmapLayers = {"All Flooding Calls": floodLayer, "Basement Flooding Calls": basementFloodLayer};
var boundaryLayers = {"Zip Codes": zipLayer, "Community Areas": commLayer};
L.control.layers(heatmapLayers, boundaryLayers).addTo(map);

var zipReq = new XMLHttpRequest();
zipReq.open("GET", "chi_zip_web.geojson", true);
zipReq.onload = function() {
    if (zipReq.status === 200) {
        var jsonResponse = JSON.parse(zipReq.responseText);
        jsonResponse.features.map(function(feature) {
          zipLayer.addData(feature);
        });
    }
    else {
        console.log('error');
    }
};
zipReq.onerror = function() {
    console.log('error');
};
zipReq.send();

var commReq = new XMLHttpRequest();
commReq.open("GET", "chi_comm_web.geojson", true);
commReq.onload = function() {
    if (commReq.status === 200) {
        var jsonResponse = JSON.parse(commReq.responseText);
        jsonResponse.features.map(function(feature) {
          commLayer.addData(feature);
        });
    }
    else {
        console.log('error');
    }
};
commReq.onerror = function() {
    console.log('error');
};
commReq.send();
