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
var indicatorPerRecipeChart = dc.barChart("#biomass-recipe-chart");
var profitChart = dc.lineChart("#profit-chart");
var biomassPerCropChart = dc.barChart("#biomass-crop-chart");
var incomePerCropChart = dc.barChart("#income-crop-chart");

var chartList = [areaChart, biomassChart, jobsChart, indicatorPerRecipeChart, profitChart, biomassPerCropChart];

createPieChart(areaChart, landuseDim, areaSum);
createLinkedRowChart(biomassChart, scenarioDim, biomassSum, syncGroup, "#33a02c");
createLinkedRowChart(jobsChart, scenarioDim, jobsSum, syncGroup, "#1f78b4");
createLineChart(profitChart, yearDim, incomeByYear, minYear, maxYear,'Year','\u20ac');
createLinearBarChart(indicatorPerRecipeChart, yearDim, biomassByRecipeStack, minYear, maxYear, 'Year','Metric Tonnes', recipeNames, recipeNames[0]);
createLinearBarChart(biomassPerCropChart, yearDim, biomassByCropStack, minYear, maxYear, 'Year','Metric Tonnes', crops, crops[0]);
createOrdinalBarChart(incomePerCropChart, cropDim, incomeByCrop, minYear, maxYear, false);

// Add interactivity to the charts
biomassChart.on('renderlet', function (chart) {
    function redrawBarChart() {
        createLinearBarChart(indicatorPerRecipeChart, yearDim, biomassByRecipeStack, minYear, maxYear, 'Year', 'Metric Tonnes', recipeNames, recipeNames[0]);
        createLinearBarChart(biomassPerCropChart, yearDim, biomassByCropStack, minYear, maxYear, 'Year','Metric Tonnes', crops, crops[0]);
        document.getElementById("by-recipe-bar-chart-title").innerHTML = "Biomass by year";
        document.getElementById("by-crop-bar-chart-title").innerHTML = "Biomass per crop";
        dc.redrawAll();
    }

    chart.selectAll('rect').on('click.monitor', redrawBarChart);
    chart.selectAll('text').on('click.monitor', redrawBarChart);
});

biomassChart.on('postRedraw', function () {
    previousLayer = currentLayer;
    currentLayer = biomassChart.filters()[0] - 1;
    map.removeLayer(geolayers[previousLayer]);
    map.addLayer(geolayers[currentLayer]);
    legend = updateLegend(legend, Object.keys(landuses[currentLayer]));
    updateDrawControl(geolayers[currentLayer]);
});

jobsChart.on('renderlet', function (chart) {
    function redrawBarChart() {
        createLinearBarChart(indicatorPerRecipeChart, yearDim, jobsByRecipeStack, minYear, maxYear, 'Year', '#', recipeNames, recipeNames[0]);
        createLinearBarChart(biomassPerCropChart, yearDim, jobsByCropStack, minYear, maxYear, 'Year','#', crops, crops[0]);
        document.getElementById("by-recipe-bar-chart-title").innerHTML = "Annual Employment Rate per Recipe";
        document.getElementById("by-crop-bar-chart-title").innerHTML = "Annual Employment Rate per Crop";
        dc.redrawAll();
    }

    chart.selectAll('rect').on('click.monitor', redrawBarChart);
    chart.selectAll('text').on('click.monitor', redrawBarChart);
});

jobsChart.on('postRedraw', function () {
    previousLayer = currentLayer;
    currentLayer = biomassChart.filters()[0] - 1;
    map.removeLayer(geolayers[previousLayer]);
    map.addLayer(geolayers[currentLayer]);
    legend = updateLegend(legend, Object.keys(landuses[currentLayer]));
    updateDrawControl(geolayers[currentLayer]);
});

// render all charts
dc.renderAll();