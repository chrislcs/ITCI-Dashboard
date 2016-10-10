/**
 * Created by Chris on 06/10/2016.
 */

// create crossfilter
var cf = crossfilter();

// add data to crossfilter
cf.add(data);

// crossfilter dimensions
var FIDDim = cf.dimension(function (d) { return d.FID; });
var landuseDim = cf.dimension(function (d) { return d.landuse; });
var scenarioDim = cf.dimension(function (d) { return d.scenario; });
var yearDim = cf.dimension(function (d) { return d.year; });
//var cropDim = cf.dimension(function (d) { return d.crop; });

// crossfilter groups
var areaSum = landuseDim.group().reduceSum(function (d) { return d.area; });
var biomassSum = scenarioDim.group().reduceSum(function (d) { return d.biomass });
var jobsSum = scenarioDim.group().reduceSum(function (d) { return d.jobs; });
var profitByYear = yearDim.group().reduceSum(function (d) { return d.biomass * biomassPrice - d.area * oilPrice * 0.01; });
var biomassByYearStack = yearDim.group().reduce(
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
