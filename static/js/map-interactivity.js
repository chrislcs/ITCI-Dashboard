/**
 * Created by Chris on 06/10/2016.
 */

map.on('draw:created', function (e) {
    //var type = e.layerType;
    var layer = e.layer;

    var shape = layer.toGeoJSON();
    var shapeLanduse = document.getElementById("landuse").value;
    shape.properties.landuse = shapeLanduse;
    var area = turf.area(shape);
    shape.properties.area = area;
    shape.properties.FID = FID;

    if (!landuses[currentLayer][shapeLanduse]) {
        landuses[currentLayer][shapeLanduse] = 1;
    } else {
        landuses[currentLayer][shapeLanduse]++;
    }

    var shape_for_db = JSON.stringify(shape.geometry);

    geolayers[currentLayer].addData(shape);

    legend = updateLegend(legend, Object.keys(landuses[currentLayer]));
    //updateDrawControl(geolayers[currentLayer]);

    // update crossfilter
    addDataToXfilter(shape, shapeLanduse, FID, currentLayer + 1,  area);

    FID++;

    biomassChart.x(d3.scale.linear().range([0, (biomassChart.width() - 50)]).domain([0, biomassSum.top(1)[0].value]));
    jobsChart.x(d3.scale.linear().range([0, (jobsChart.width() - 50)]).domain([0, jobsSum.top(1)[0].value]));

    biomassPerRecipeChart.group();
    dc.redrawAll();
});

map.on('draw:deleted', function (e) {
    // remove all current filters on dimensions and charts
    removeFilters(dimensionList, chartList);

    for (var layer in e.layers._layers) {
        if (e.layers._layers.hasOwnProperty(layer)) {
            // delete the data of deleted layers from the crossfilter
            FIDDim.filter(e.layers._layers[layer]["feature"]["properties"]["FID"]);
            cf.remove();

            // delete legend entry
            landuses[currentLayer][e.layers._layers[layer]["feature"]["properties"]["landuse"]]--;
            if (landuses[currentLayer][e.layers._layers[layer]["feature"]["properties"]["landuse"]] === 0) {
                delete landuses[currentLayer][e.layers._layers[layer]["feature"]["properties"]["landuse"]];
            }
        }
    }
    FIDDim.filterAll();

    // redraw charts and legend
    dc.redrawAll();
    legend = updateLegend(legend, Object.keys(landuses[currentLayer]));
});

$('#add-scenario').bind('click', function () {
    removeFilters(dimensionList, chartList);

    geolayers.push(new L.geoJson([], {
        style: style,
        onEachFeature: onEachFeature
    }));

    previousLayer = currentLayer;
    currentLayer = geolayers.length - 1;
    map.removeLayer(geolayers[previousLayer]);
    landuses.push({});

    legend = updateLegend(legend, Object.keys(landuses[currentLayer]));

    var filterOnce;
    syncGroup.forEach(function (chart) {
        if (!filterOnce) {
            filterOnce = true;
            chart.filterAll();
            chart.filter(currentLayer + 1);
            return;
        }
        chart.filters().fill(currentLayer + 1);
    });

    cf.add([{
        "FID": 999,
        "year": minYear,
        "scenario": currentLayer + 1,
        "landuse": '',
        "area": 0,
        "biomass": 0,
        "testData": 0,
        "jobs": 0
    }]);

    dc.redrawAll();
});

$('#mapid').on('click', '.edit', function () {
    var newLanduse = prompt("Enter a new land use");

    if (Object.keys(recipes).indexOf(newLanduse)>=0) {
        // remove all current filters on dimensions and charts
        removeFilters(dimensionList, chartList);

        // update legend entries
        landuses[currentLayer][geolayers[currentLayer]._layers[lastClickedFeature].feature.properties.landuse]--;
        if (landuses[currentLayer][geolayers[currentLayer]._layers[lastClickedFeature].feature.properties.landuse] === 0) {
            delete landuses[currentLayer][geolayers[currentLayer]._layers[lastClickedFeature].feature.properties.landuse];
        }
        if (!landuses[currentLayer][newLanduse]) {
            landuses[currentLayer][newLanduse] = 1;
        } else {
            landuses[currentLayer][newLanduse]++;
        }
        legend = updateLegend(legend, Object.keys(landuses[currentLayer]));

        // adjust feature properties and color
        geolayers[currentLayer]._layers[lastClickedFeature].feature.properties.landuse = newLanduse;
        geolayers[currentLayer]._layers[lastClickedFeature].options.fillColor = colorScale(newLanduse);
        geolayers[currentLayer]._layers[lastClickedFeature].setStyle({fillColor: colorScale(newLanduse)});

        // update the data in the crossfilter
        FIDDim.filter(geolayers[currentLayer]._layers[lastClickedFeature].feature.properties.FID);
        var currentFID = FIDDim.top(1)[0].FID;
        var area = FIDDim.top(1)[0].area;
        var scenario = FIDDim.top(1)[0].scenario;
        cf.remove();

        addDataToXfilter(geolayers[currentLayer]._layers[lastClickedFeature].feature, newLanduse, currentFID, scenario, area);

        FIDDim.filterAll();
        dc.redrawAll();
    } else if (newLanduse !== null) {
        alert('Recipe not found, check recipes tab for names')
    }
});