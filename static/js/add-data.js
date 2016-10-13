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
    var currentRecipe = recipes[feature["properties"]["landuse"]];
    var returnData = {};
    if(typeof currentRecipe != 'undefined') {

        for (var i=0; i<currentRecipe.length; i++){
            var currentCrop = currentRecipe[i].crop;
            returnData[currentCrop] = getUrlJsonSync('/retrieve_data', {
                crop: currentCrop,
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
        crop: 'transportdist_wgs',
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

function retrieveData(feature, array, scenario) {
    function addData(feature) {
        var area = turf.area(feature);
        feature["properties"]["area"] = area;
        feature["properties"]["FID"] = FID;
        var recipeData = loadRecipeDataFromDatabase(feature);
        var distData = loadDistanceDataFromDatabase(feature);
        for (var y = 1; y < 21; y++) {
            for (var crop in recipeData) {
                if (recipeData.hasOwnProperty(crop)) {
                    var currentRecipe = recipes[feature["properties"]["landuse"]];
                    for (var i= 0; i<currentRecipe.length; i++) {
                        if (currentRecipe[i]['crop'] === crop) {
                            var efficiency = currentRecipe[i]['efficiency'] / 100.0;
                            var startYear = currentRecipe[i]['startyear'];
                            var endYear = currentRecipe[i]['endyear'];
                        }
                    }

                    if (y >= startYear && y <= endYear) {
                        array.push({
                            "FID": FID,
                            "year": y,
                            "scenario": scenario,
                            "landuse": feature["properties"]["landuse"],
                            "area": area,
                            "crop": crop,
                            "biomass": recipeData[crop][y-startYear+1]["sum"] * efficiency,
                            "distance_mean": distData['distance_mean'][1]["mean"],
                            "jobs": (Math.random() * area) / (100000 * 20)
                        });
                    } else {
                        array.push({
                            "FID": FID,
                            "year": y,
                            "scenario": scenario,
                            "landuse": feature["properties"]["landuse"],
                            "area": area,
                            "crop": crop,
                            "biomass": 0,
                            "distance_mean": 0,
                            "jobs": 0
                        });
                    }
                }
            }
        }
    }
    if (feature.type === 'FeatureCollection') {
        for (var i = 0; i < feature.features.length; i++) {
            addData(feature.features[i]);
            FID++;
        }
    } else {
        addData(feature);
        FID++;
    }
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
        fillOpacity: 0.2
    }
}

if (typeof shapes[currentLayer] !== 'undefined') {
    for (var i = 0; i < shapes.length; i++) {
        // determine the number of unique landuses in the initial polygons
        landuses.push(countItems(shapes[i], "landuse", landuses[i]));

        // each initial polygon
        retrieveData(shapes[i], data, i + 1);

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