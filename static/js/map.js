/**
 * Created by Chris on 06/10/2016.
 */

// load map tiles
var aerial = new L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'clucas.pc627m64',
    accessToken: 'pk.eyJ1IjoiY2x1Y2FzIiwiYSI6ImNpbGt6dGd5ajAwMXV1YWx6YXRpYjlmYTAifQ.jS-ZW_hgyB6RIElxVQ8V5g'
});

var terrain = new L.tileLayer('https://api.mapbox.com/styles/v1/hertshoorn/city5smjk00aa2itbe6ae83bc/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVydHNob29ybiIsImEiOiJjaXNuZW1jYjMwMDB3MnhrMWd1ZHZ6ODd4In0.ud2kfxoF2nh9bACEipQDnA', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18
});

var DEM = new L.TileLayer.WMS('http://localhost:8080/geoserver/ITCI_Dashboard/wms', {
    layers: 'ITCI_Dashboard:DEM',
    styles: '',
    format: 'image/png',
    transparent: true
    //attribution: ''
    //crs: 'EPSG:4326'
});

var map = L.map('mapid', {
    crs: L.CRS.EPSG4326,
    layers: [aerial, terrain, DEM]
}).setView([-0.86930, 116.62068], 13);

var baseMaps = {
    "Aerial Photo": aerial,
    "Terrain Layer" : terrain
};

var overlayMaps = {
    "DEM": DEM
};

L.control.layers(baseMaps, overlayMaps).addTo(map);

var outlineStyle =
{
    "color": "#3f633f",
    "weight": 2,
    "opacity": 0.35
};

var outlineLayer = new L.geoJson(outline,{
    style: outlineStyle
});
map.addLayer(outlineLayer);

var outlineInsideLayer = new L.geoJson(outlineInside,{
    style: {
        "color": "#3ca156",
        "weight": 0,
        "opacity": 0.35
    }
});
map.addLayer(outlineInsideLayer);

map.on('zoomed', function () {
    currentZoom = map.getZoom();
    if (currentZoom > 11) {
        outlineLayer.setStyle({weight: 2});
    }
    else {
        outlineLayer.setStyle({weight: 4});
    }
});


function updateLegend(legend, items) {
    if (legend instanceof L.Control) {
        map.removeControl(legend);
    }
    legend = L.control({position: 'bottomright'});
    legend.onAdd = function () {

        var div = L.DomUtil.create('div', 'info legend');
        items = items.sort();

        for (var i = 0; i < items.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colorScale(items[i]) + '"></i> ' +
                items[i] + '<br>';
        }

        return div;
    };

    legend.addTo(map);

    return legend;
}

function updateDrawControl(featureGroup) {
    if (drawControl instanceof L.Control) {
        map.removeControl(drawControl);
    }
    drawControl = new L.Control.Draw({
        draw: {
            position: 'topleft',
            polyline: false,
            marker: false,
            circle: false
        },
        edit: {
            featureGroup: featureGroup,
            remove: true,
            edit: false
        }
    });
    map.addControl(drawControl);
}