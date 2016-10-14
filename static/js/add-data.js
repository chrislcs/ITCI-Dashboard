/**
 * Created by Chris on 06/10/2016.
 */

function countItems(feature, key) {
    var result = {};
    if (feature.type === 'FeatureCollection') {
        for (var i = 0; i < feature.features.length; i++) {
            var item = feature.features[i]["properties"][key];
            if (!result[item]) {
                result[item] = 0;
            }
            result[item]++;
        }
        return result
    } else {
        return result[feature["properties"][key]] = 1;
    }
}

function loadRecipeDataFromDatabase(feature) {
    var currentRecipe = recipes[feature["properties"]["landuse"]]['crops'];
    var returnData = {};
    if(typeof currentRecipe != 'undefined') {
        for (var i=0; i<currentRecipe.length; i++){
            var currentCrop = currentRecipe[i].crop;
            returnData[currentCrop] = getUrlJsonSync('/retrieve_data', {
                raster: currentCrop,
                shape: JSON.stringify(feature.geometry)
            });
            if (returnData[currentCrop].valid === "OK") {
                returnData[currentCrop] = returnData[currentCrop].data;
            } else {
                console.log("ERROR: failed to load data from database for feature with ID: " + FID + ", for crop:" + currentCrop);
                returnData[currentCrop] = 0;
            }
        }
    } else {
        console.log("ERROR: Recipe not found for feature with ID: " + FID + ", with land use:" + feature["properties"]["landuse"]);
    }
    return returnData;
}

function loadDistanceDataFromDatabase(feature) {
    var returnData = {};
    returnData['distance_mean'] = getUrlJsonSync('/retrieve_data',{
        raster: 'transportdist_wgs',
        shape: JSON.stringify(feature.geometry)
    });
    if (returnData['distance_mean'].valid === "OK") {
                returnData['distance_mean'] = returnData['distance_mean'].data;
            } else {
                console.log("ERROR: failed to load data from database for feature with ID: " + FID + ", transportdist_wgs ");
                returnData['distance_mean'] = 0;
            }
    return returnData;
}

function addDataToXfilter(shape, shapeLanduse, FID, scenario, area) {
    var recipeData = loadRecipeDataFromDatabase(shape);
    var distData = loadDistanceDataFromDatabase(shape);
    for (var y = 1; y < 21; y++) {
        for (var crop in recipeData) {
            if (recipeData.hasOwnProperty(crop)) {
                var currentRecipe = recipes[shapeLanduse];
                for (var i = 0; i < currentRecipe['crops'].length; i++) {
                    if (currentRecipe['crops'][i]['crop'] === crop) {
                        var efficiency = currentRecipe['crops'][i]['efficiency'] / 100.0;
                        var startYear = currentRecipe['crops'][i]['startyear'];
                        var endYear = currentRecipe['crops'][i]['endyear'];
                        var areaFraction = currentRecipe['crops'][i]['area'] / 100.0;
                        if (y >= startYear && y <= endYear) {
                            cf.add([{
                                "FID": FID,
                                "year": y,
                                "scenario": scenario,
                                "landuse": shapeLanduse,
                                "area": area,
                                "crop": crop,
                                "biomass": recipeData[crop]["sum"] * cropfrac[crop][y - startYear] * efficiency * areaFraction,
                                "distance_mean": distData['distance_mean'][1]["mean"],
                                "jobs": currentRecipe['labor']
                            }]);

                        } else {
                            cf.add([{
                                "FID": FID,
                                "year": y,
                                "scenario": scenario,
                                "landuse": shapeLanduse,
                                "area": area,
                                "crop": crop,
                                "biomass": 0,
                                "distance_mean": 0,
                                "jobs": 0
                            }]);
                        }
                    }
                }
            }
        }
    }
}

function retrieveData(feature, scenario) {
    function addData(feature, scenario) {
        var area = turf.area(feature);
        feature["properties"]["area"] = area;
        feature["properties"]["FID"] = FID;
        addDataToXfilter(feature, feature["properties"]["landuse"], FID, scenario, area);
    }
    if (feature.type === 'FeatureCollection') {
        for (var i = 0; i < feature.features.length; i++) {
            addData(feature.features[i], scenario);
            FID++;
        }
    } else {
        addData(feature, scenario);
        FID++;
    }
}

function reloadData() {
    function removeData(ndx, dimensions) {
        dimensions.forEach(function (dim) {
            dim.filter(null)
        });
        ndx.remove();
    }

    removeData(cf, dimensionList);

    // Add data to crossfilter
    for (var i=0; i<geolayers.length; i++){
        Object.keys(geolayers[i]._layers).forEach(function (key, index) {
            retrieveData(geolayers[i]._layers[key]['feature'], i+1);
        });
    }

    dc.redrawAll();
}

function onEachFeature(feature, layer) {
    layer.on('click', function (e) {
        lastClickedFeature = e.target._leaflet_id;
        e.target.bindPopup('<button class="edit">Edit</button> ' + e.target.feature.properties.landuse, {'className': 'custom-popup'}).openPopup();
    });
}

function style(feature) {
    return {
        fillColor: colorScale(feature.properties.landuse),
        weight: 1,
        opacity:0.5,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0.5
    }
}

if (typeof shapes[currentLayer] !== 'undefined') {
    for (var i = 0; i < shapes.length; i++) {
        // determine the number of unique landuses in the initial polygons
        landuses.push(countItems(shapes[i], "landuse", landuses[i]));

        // each initial polygon
        retrieveData(shapes[i], i + 1);

        // draw the initial polygons
        geolayers.push(new L.geoJson(shapes[i], {
            onEachFeature: onEachFeature,
            style: style
        }));
    }
    map.addLayer(geolayers[currentLayer]);
}

legend = updateLegend(legend, Object.keys(landuses[currentLayer]));

updateDrawControl(geolayers[currentLayer]);