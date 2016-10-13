/**
 * Created by Chris on 10/08/2016.
 */

function createLinkedRowChart(chart, dimension, group, syncGroup, color) {
    chart
        .syncGroup(syncGroup)
        .margins({top: 20, left: 10, right: 10, bottom: 45})
        //.x(d3.scale.linear().range([0, (chart.width() - 50)]).domain([0, group.top(1)[0].value]))
        .elasticX(true)
        .dimension(dimension)
        .group(group)
        .label(function (d) {
            return "Scenario " + d.key;
        })
        .title(function (d) {
            return d.value;
        })
        .colors(color)
        .minHeight(100)
        .filter(1)
        .xAxis().ticks(4).tickFormat(d3.format("s"));
    //.tickFormat(d3.format("s"));
}

function createPieChart(chart, dimension, group) {
    chart
        .slicesCap(9)
        .innerRadius(30)
        .dimension(dimension)
        .group(group)
        .colors(colorScale)
        //.renderLabel(false)
        //.legend(dc.legend())
        // workaround for #703: not enough data is accessible through .label() to display percentages
        .on('pretransition', function (chart) {
            chart.selectAll('text.pie-slice').text(function (d) {
                return d.data.key + " (" + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2 * Math.PI) * 100) + '%)';
            })
        });
}

function createLinearBarChart(chart, dimension, group, minX, maxX, stack, stackOn) {
    chart
        .x(d3.scale.linear().domain([minX, maxX]))
        //.y(d3.scale.linear().domain([0, maxY])) //.range([0, (chart.height() - 50)])
        .elasticY(true)
        .brushOn(false)
        //.yAxisLabel("This is the Y Axis!")
        .dimension(dimension)
        .group(group)
        //.xAxisLabel("Year")
        .yAxis().tickFormat(d3.format("s"));

    if (stack !== false) {
        function sel_stack(i) {
            return function (d) {
                return d.value[i];
            };
        }


        chart
            .group(group, stackOn, sel_stack(stackOn))
            .title(function (d) {
                return d.key + '[' + [this.layer] + ']: ' + d.value[this.layer];
            });

        for (var i=0; i<stack.length; i++) {
            if (stack[i]!==stackOn) {
                chart.stack(group, stack[i], sel_stack(stack[i]));
            }
        }
    }

    chart.on('renderlet', function (chart) {
        chart.selectAll("g.x text")
            .attr("transform", "translate(6, 0)");
    });
}

function createOrdinalBarChart(chart, dimension, group) {
    chart
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .brushOn(false)
        //.yAxisLabel("This is the Y Axis!")
        .dimension(dimension)
        .group(group)
        //.xAxisLabel("Year")
        .yAxis().tickFormat(d3.format("s"));

    chart.on('renderlet', function (chart) {
        chart.selectAll("g.x text")
            .attr("transform", "translate(6, 0)");
    });
}

function createLineChart(chart, dimension, group, minX, maxX, stack, stackOn) {
    chart
        .x(d3.scale.linear().domain([minX, maxX]))
        //.y(d3.scale.linear().range([0, (chart.height() - 50)]).domain([minY, maxY]))
        .elasticY(true)
        //.interpolate('step-before')
        .renderArea(false)
        .brushOn(false)
        .renderDataPoints(false)
        .clipPadding(10)
        //.yAxisLabel("This is the Y Axis!")
        .dimension(dimension)
        .group(group)
        .yAxis().tickFormat(d3.format("s"));

    if (typeof(stack) !== 'undefined') {
        function sel_stack(i) {
            return function (d) {
                return d.value[i];
            };
        }

        chart
            .group(group, stackOn, sel_stack(stackOn))
            .title(function (d) {
                return d.key + '[' + [this.layer] + ']: ' + d.value[this.layer];
            });

        for (var i=0; i<stack.length; i++) {
            if (stack[i]!==stackOn) {
                chart.stack(group, stack[i], sel_stack(stack[i]));
            }
        }
    }
}