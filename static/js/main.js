/**
 * Created by Chris on 08/08/2016.
 */

$(document).ready(function(){

	$('ul.tabs li').click(function(){
		var tab_id = $(this).attr('data-tab');

		$('ul.tabs li').removeClass('current');
		$('.tab-content').removeClass('current');

		$(this).addClass('current');
		$("#"+tab_id).addClass('current');
	})

});


$(document).ajaxStart(function () {
    $('.load-screen').show();
});
$(document).ajaxStop(function () {
    $('.load-screen').hide();
});
$(document).ajaxError(function () {
    $('.load-screen').hide();
});


function getUrlJsonSync(url, data){
    var jqxhr;
    if (typeof(data)!='undefined') {

        jqxhr = $.ajax({
            type: "GET",
            url: url,
            data: data,
            dataType: 'json',
            cache: false,
            async: false
        });
    } else {
        jqxhr = $.ajax({
            url: url,
            dataType: 'json',
            cache: false,
            async: false
        });
    }

    // 'async' has to be 'false' for this to work
    return {valid: jqxhr.statusText,  data: jqxhr.responseJSON};
}

function loadShape(url) {
    var returnData = getUrlJsonSync(url);
    if (returnData.valid === "OK") {
        returnData = returnData.data;
    } else {
        console.log("ERROR: failed to load data from database for feature with ID: " + FID);
        returnData = 0;
    }
    return returnData;
}

var recipes = {
    "Recipe 1":{"crops": [{"crop":"SugarPalm", "startyear":1, "endyear":11, "area": 25, "efficiency":90},
                          {"crop":"SugarPalm", "startyear":3, "endyear":14, "area": 25, "efficiency":90},
                          {"crop":"SugarPalm", "startyear":6, "endyear":17, "area": 25, "efficiency":90},
                          {"crop":"SugarPalm", "startyear":9, "endyear":20, "area": 25, "efficiency":90},
                          {"crop":"Cassava", "startyear":1, "endyear":2, "area": 75, "efficiency":20},
                          {"crop":"Cassava", "startyear":3, "endyear":5, "area": 50, "efficiency":20},
                          {"crop":"Cassava", "startyear":6, "endyear":8, "area": 25, "efficiency":20},
                          {"crop":"Cassava", "startyear":12, "endyear":14, "area": 25, "efficiency":20},
                          {"crop":"Cassava", "startyear":15, "endyear":17, "area": 50, "efficiency":20},
                          {"crop":"Cassava", "startyear":18, "endyear":20, "area": 75, "efficiency":20}],
                "labor": 80},
    "Recipe 2":{"crops": [{"crop":"SugarPalm", "startyear":1, "endyear":11, "area": 50, "efficiency":90},
                          {"crop":"SugarPalm", "startyear":3, "endyear":14, "area": 50, "efficiency":90},
                          {"crop":"SugarPalm", "startyear":6, "endyear":17, "area": 25, "efficiency":90},
                          {"crop":"SugarPalm", "startyear":9, "endyear":20, "area": 25, "efficiency":90},
                          {"crop":"Cassava", "startyear":1, "endyear":2, "area": 50, "efficiency":25},
                          {"crop":"Cassava", "startyear":12, "endyear":14, "area": 50, "efficiency":25},
                          {"crop":"Cassava", "startyear":15, "endyear":20, "area": 100, "efficiency":30}],
                "labor": 40},
    "Recipe 3":{"crops": [{"crop":"SugarPalm", "startyear":1, "endyear":11, "area": 100, "efficiency":55},
                          {"crop":"Cassava", "startyear":1, "endyear":11, "area": 100, "efficiency":15},
                          {"crop":"SugarPalm", "startyear":12, "endyear":20, "area": 100, "efficiency":45},
                          {"crop":"Cassava", "startyear":12, "endyear":20, "area": 100, "efficiency":10}],
                "labor": 20},
    "Recipe 4":{"crops": [{"crop":"OilPalm", "startyear":1, "endyear":20, "area": 100, "efficiency":100}],
                "labor": 10}
};
var recipeNames = Object.keys(recipes);
var outline = loadShape('../static/data/ITCI_Boundary.geojson');
var outlineInside = loadShape('../static/data/ITCI_Boundary_inside.geojson');
var shapes = [loadShape('../static/data/Scenario2.geojson'), loadShape('../static/data/Scenario1.geojson')];
var FID = 0;
var colorScale = d3.scale.category10();
var lastClickedFeature;
var geolayers = [];
var currentLayer = 0;
var previousLayer = 0;
var landuses = [];
var legend;
var drawControl;
var cassavaPrice = 350;
var palmoilPrice = 580;
var palmsugarPrice = 668;
var petrolPrice = 1000;
var crops = ["Cassava", "SugarPalm", "OilPalm"];

// create crossfilter
var cf = crossfilter();