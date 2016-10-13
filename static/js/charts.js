/**
 * Created by Chris on 06/10/2016.
 */

var syncGroup = [];

// calculate min and max values of certain data
var minYear = yearDim.bottom(1)[0].year;
var maxYear = yearDim.top(1)[0].year;

// create charts
var areaChart = dc.pieChart("#area-chart");
var biomassChart = dc.linkedRowChart("#biomass-chart");
var jobsChart = dc.linkedRowChart("#jobs-chart");
var biomassPerRecipeChart = dc.barChart("#biomass-recipe-chart");
var profitChart = dc.lineChart("#profit-chart");
var biomassPerCropChart = dc.barChart("#biomass-crop-chart");
var incomePerCropChart = dc.barChart("#income-crop-chart");

var chartList = [areaChart, biomassChart, jobsChart, biomassPerRecipeChart, profitChart, biomassPerCropChart];

createPieChart(areaChart, landuseDim, areaSum);
createLinkedRowChart(biomassChart, scenarioDim, biomassSum, syncGroup, "#33a02c");
createLinkedRowChart(jobsChart, scenarioDim, jobsSum, syncGroup, "#1f78b4");
createLineChart(profitChart, yearDim, incomeByYear, minYear, maxYear,'Year','\u20ac');
createLinearBarChart(biomassPerRecipeChart, yearDim, biomassByRecipeStack, minYear, maxYear, 'Year','Metric Tonnes', Object.keys(landuses[currentLayer]), Object.keys(landuses[currentLayer])[0]);
createLinearBarChart(biomassPerCropChart, yearDim, biomassByCropStack, minYear, maxYear, 'Year','Metric Tonnes', crops, crops[0]);
createOrdinalBarChart(incomePerCropChart, cropDim, incomeByCrop, minYear, maxYear, false);

// Add interactivity to the charts
biomassChart.on('renderlet', function (chart) {
    function redrawBarChart() {
        previousLayer = currentLayer;
        currentLayer = biomassChart.filters()[0] - 1;
        createLinearBarChart(biomassPerRecipeChart, yearDim, biomassByRecipeStack, minYear, maxYear, 'Year', 'Metric Tonnes', landuses[currentLayer], Object.keys(landuses[currentLayer])[0]);
        document.getElementById("by-year-bar-chart-title").innerHTML = "Biomass by year";
        dc.redrawAll();
    }

    chart.selectAll('rect').on('click.monitor', redrawBarChart);
    chart.selectAll('text').on('click.monitor', redrawBarChart);
});

biomassChart.on('postRedraw', function () {
    map.removeLayer(geolayers[previousLayer]);
    map.addLayer(geolayers[currentLayer]);
    legend = updateLegend(legend, Object.keys(landuses[currentLayer]));
    updateDrawControl(geolayers[currentLayer]);
});

jobsChart.on('renderlet', function (chart) {
    function redrawBarChart() {
        previousLayer = currentLayer;
        currentLayer = biomassChart.filters()[0] - 1;
        createLinearBarChart(biomassPerRecipeChart, yearDim, jobsByYearStack, minYear, maxYear, 'Year', 'Metric Tonnes', landuses[currentLayer], Object.keys(landuses[currentLayer])[0]);
        document.getElementById("by-year-bar-chart-title").innerHTML = "Annual Employment Rate";
        dc.redrawAll();
    }

    chart.selectAll('rect').on('click.monitor', redrawBarChart);
    chart.selectAll('text').on('click.monitor', redrawBarChart);
});

jobsChart.on('postRedraw', function () {
    map.removeLayer(geolayers[previousLayer]);
    map.addLayer(geolayers[currentLayer]);
    legend = updateLegend(legend, Object.keys(landuses[currentLayer]));
    updateDrawControl(geolayers[currentLayer]);
});

// render all charts
dc.renderAll();