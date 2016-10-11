/**
 * Created by Chris on 17/08/2016.
 */

$(function() {
    $("#cassava-slider").slider({
        range: "max",
        min: 0,
        max: 100,
        value: 50,
        slide: function(event, ui) {
            $( "#cassava-price" ).val( ui.value );
        },
        stop: function(event, ui) {
            cassavaPrice = ui.value;
            profitByYear = yearDim.group().reduceSum(function (d) {
                if (d.crop === "Cassava") {
                    return d.biomass * cassavaPrice;
                } else if (d.crop === "SugarPalm") {
                    return d.biomass * palmsugarPrice;
                } else if (d.crop === "OilPalm") {
                    return d.biomass * palmoilPrice;
                }
            });
            createLineChart(profitChart, yearDim, profitByYear, minYear, maxYear);
            dc.redrawAll();
        }
    });
    $( "#cassava-price" ).val( $( "#cassava-slider" ).slider( "value" ) );
});

$(function() {
    $("#palmoil-slider").slider({
        range: "max",
        min: 0,
        max: 100,
        value: 50,
        slide: function(event, ui) {
            $( "#palmoil-price" ).val( ui.value );
        },
        stop: function(event, ui) {
            palmoilPrice = ui.value;
            profitByYear = yearDim.group().reduceSum(function (d) {
                if (d.crop === "Cassava") {
                    return d.biomass * cassavaPrice;
                } else if (d.crop === "SugarPalm") {
                    return d.biomass * palmsugarPrice;
                } else if (d.crop === "OilPalm") {
                    return d.biomass * palmoilPrice;
                }
            });
            createLineChart(profitChart, yearDim, profitByYear, minYear, maxYear);
            dc.redrawAll();
        }
    });
    $( "#palmoil-price" ).val( $( "#palmoil-slider" ).slider( "value" ) );
});

$(function() {
    $("#palmsugar-slider").slider({
        range: "max",
        min: 0,
        max: 100,
        value: 50,
        slide: function(event, ui) {
            $( "#palmsugar-price" ).val( ui.value );
        },
        stop: function(event, ui) {
            palmsugarPrice = ui.value;
            profitByYear = yearDim.group().reduceSum(function (d) {
                if (d.crop === "Cassava") {
                    return d.biomass * cassavaPrice;
                } else if (d.crop === "SugarPalm") {
                    return d.biomass * palmsugarPrice;
                } else if (d.crop === "OilPalm") {
                    return d.biomass * palmoilPrice;
                }
            });
            createLineChart(profitChart, yearDim, profitByYear, minYear, maxYear);
            dc.redrawAll();
        }
    });
    $( "#palmsugar-price" ).val( $( "#palmsugar-slider" ).slider( "value" ) );
});

//$(function() {
//    $("#oil-slider").slider({
//        range: "max",
//        min: 0,
//        max: 100,
//        value: 50,
//        slide: function(event, ui) {
//            $( "#oil-price" ).val( ui.value );
//        },
//        stop: function(event, ui) {
//            oilPrice = ui.value;
//            profitByYear = yearDim.group().reduceSum(function (d) { return d.biomass * biomassPrice - d.area * oilPrice * 0.01; });
//            createLineChart(profitChart, yearDim, profitByYear, minYear, maxYear);
//            dc.redrawAll();
//        }
//    });
//    $( "#oil-price" ).val( $( "#oil-slider" ).slider( "value" ) );
//});
