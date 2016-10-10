/**
 * Created by Chris on 17/08/2016.
 */

$(function() {
    $("#biomass-slider").slider({
        range: "max",
        min: 0,
        max: 100,
        value: 50,
        slide: function(event, ui) {
            $( "#biomass-price" ).val( ui.value );
        },
        stop: function(event, ui) {
            biomassPrice = ui.value;
            profitByYear = yearDim.group().reduceSum(function (d) { return d.biomass * biomassPrice - d.area * oilPrice * 0.01; });
            createLineChart(profitChart, yearDim, profitByYear, false, minYear, maxYear);
            dc.redrawAll();
        }
    });
    $( "#biomass-price" ).val( $( "#biomass-slider" ).slider( "value" ) );
});

$(function() {
    $("#oil-slider").slider({
        range: "max",
        min: 0,
        max: 100,
        value: 50,
        slide: function(event, ui) {
            $( "#oil-price" ).val( ui.value );
        },
        stop: function(event, ui) {
            oilPrice = ui.value;
            profitByYear = yearDim.group().reduceSum(function (d) { return d.biomass * biomassPrice - d.area * oilPrice * 0.01; });
            createLineChart(profitChart, yearDim, profitByYear, false, minYear, maxYear);
            dc.redrawAll();
        }
    });
    $( "#oil-price" ).val( $( "#oil-slider" ).slider( "value" ) );
});
