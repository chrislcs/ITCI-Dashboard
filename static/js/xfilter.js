/**
 * Created by Chris on 06/10/2016.
 */



// add data to crossfilter
//cf.add(data);

// crossfilter dimensions
var FIDDim = cf.dimension(function (d) { return d.FID; });
var landuseDim = cf.dimension(function (d) { return d.landuse; });
var scenarioDim = cf.dimension(function (d) { return d.scenario; });
var yearDim = cf.dimension(function (d) { return d.year; });
var cropDim = cf.dimension(function (d) { return d.crop; });
var dimensionList = [FIDDim, landuseDim, scenarioDim, yearDim, cropDim];

// crossfilter groups
var areaSum = landuseDim.group().reduceSum(function (d) { return d.area; });
var biomassSum = scenarioDim.group().reduceSum(function (d) { return d.biomass });
var jobsSum = scenarioDim.group().reduceSum(function (d) { return d.jobs; });
var incomeByCrop = cropDim.group().reduceSum(function (d) {
    if (d.crop === "Cassava") {
        return d.biomass * cassavaPrice ;
    } else if (d.crop === "SugarPalm") {
        return d.biomass * palmsugarPrice ;
    } else if (d.crop === "OilPalm") {
        return d.biomass * palmoilPrice ;
    }
});
var incomeByYear = yearDim.group().reduceSum(function (d) {
    if (d.crop === "Cassava") {
        return d.biomass * cassavaPrice ;
    } else if (d.crop === "SugarPalm") {
        return d.biomass * palmsugarPrice ;
    } else if (d.crop === "OilPalm") {
        return d.biomass * palmoilPrice ;
    }
});

var expenseByYear = yearDim.group().reduceSum(function (d) {
    if (d.crop === "Cassava") {
        return (((d.biomass/20)* d.distance_mean*2*(1/8)*petrolPrice)+ d.jobs*5000);
    } else if (d.crop === "SugarPalm") {
        return (((d.biomass/10)* d.distance_mean*2*(1/8)*petrolPrice)+d.jobs*5000);
    } else if (d.crop === "OilPalm") {
        return  (((d.biomass/20)* d.distance_mean*2*(1/8)*petrolPrice)+d.jobs*5000);
    }
});


var biomassByRecipeStack = yearDim.group().reduce(
    function (p, v) {
        p[v.landuse] = (p[v.landuse] || 0) + v.biomass;
        return p;
    }, function (p, v) {
        p[v.landuse] = (p[v.landuse] || 0) - v.biomass;
        return p;
    }, function () {
        return {};
    }
);
var biomassByCropStack = yearDim.group().reduce(
    function (p, v) {
        p[v.crop] = (p[v.crop] || 0) + v.biomass;
        return p;
    }, function (p, v) {
        p[v.crop] = (p[v.crop] || 0) - v.biomass;
        return p;
    }, function () {
        return {};
    }
);
//var jobsByYear = yearDim.group().reduceSum(function(d) { return d.jobs; });
var jobsByYearStack = yearDim.group().reduce(
    function (p, v) {
        p[v.landuse] = (p[v.landuse] || 0) + v.jobs;
        return p;
    }, function (p, v) {
        p[v.landuse] = (p[v.landuse] || 0) - v.jobs;
        return p;
    }, function () {
        return {};
    }
);


function removeFilters(dimensions, charts) {
    dimensions.forEach(function (dim) {
        dim.filter(null)
    });
    charts.forEach(function (chart) {
        chart.filter(null)
    })
}