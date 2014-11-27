angular.module('angularCharts').factory('pointChart', function(Utils, Tooltips) {

    function pointChart(chart, scope, getColor) {
        var config = chart.config;
        var margin = {
            top: 0,
            right: 40,
            bottom: 20,
            left: 40
        };
        chart.width -= margin.left - margin.right;
        chart.height -= margin.top - margin.bottom;

        var x = d3.scale.ordinal()
            .domain(chart.points.map(function(d) {
                return d.x;
            }))
            .rangeRoundBands([0, chart.width]);

        var y = d3.scale.linear()
            .range([chart.height, 10]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
        Utils.filterXAxis(chart, xAxis, x);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(5)
            .tickFormat(d3.format(config.yAxisTickFormat));

        var yData = [0];
        var linedata = [];

        chart.points.forEach(function(d) {
            d.y.map(function(e, i) {
                yData.push(e);
            });
        });

        var yMaxPoints = d3.max(chart.points.map(function(d) {
            return d.y.length;
        }));
        scope.yMaxPoints = yMaxPoints;

        chart.series.slice(0, yMaxPoints).forEach(function(value, index) {
            var d = {};
            d.series = value;
            d.values = chart.points.map(function(point) {
                return point.y.map(function(e) {
                    return {
                        x: point.x,
                        y: e
                    };
                })[index] || {
                    x: chart.points[index].x,
                    y: 0
                };
            });
            linedata.push(d);
        });

        var svg = d3.select(chart.chartContainer[0]).append("svg")
            .attr("width", chart.width + margin.left + margin.right)
            .attr("height", chart.height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var padding = d3.max(yData) * 0.20;

        y.domain([d3.min(yData), d3.max(yData) + padding]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + chart.height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        svg.selectAll(".points")
            .data(linedata)
            .enter().append("g");

        /**
         * Add points
         * @param  {[type]} value [description]
         * @param  {[type]} key   [description]
         * @return {[type]}       [description]
         */
        angular.forEach(linedata, function(value, key) {
            var points = svg.selectAll('.circle')
                .data(value.values)
                .enter();

            points.append("circle")
                .attr("cx", function(d) {
                    return getX(d.x);
                })
                .attr("cy", function(d) {
                    return y(d.y);
                })
                .attr("r", 3)
                .style("fill", getColor(linedata.indexOf(value)))
                .style("stroke", getColor(linedata.indexOf(value)))
                .on("mouseover", (function(series) {
                    return function(d) {

                        Tooltips.makeToolTip(chart, scope, {
                            index: d.x,
                            value: d.tooltip ? d.tooltip : d.y,
                            series: series
                        }, d3.event);

                        config.mouseover(d, d3.event);
                        scope.$apply();
                    };
                })(value.series))
                .on("mouseleave", function(d) {
                    Tooltips.removeToolTip(scope);
                    config.mouseout(d, d3.event);
                    scope.$apply();
                })
                .on("mousemove", function(d) {
                    Tooltips.updateToolTip(scope, d, d3.event);
                })
                .on("click", function(d) {
                    config.click(d, d3.event);
                    scope.$apply();
                });

            if (config.labels) {
                points.append("text")
                    .attr("x", function(d) {
                        return getX(d.x);
                    })
                    .attr("y", function(d) {
                        return y(d.y);
                    })
                    .text(function(d) {
                        return d.y;
                    });
            }
        });

        /**
         * Returns x point of line point
         * @param  {[type]} d [description]
         * @return {[type]}   [description]
         */
        function getX(d) {
            return Math.round(x(d)) + x.rangeBand() / 2;
        }
    }

    return pointChart;
})