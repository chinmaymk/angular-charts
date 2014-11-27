angular.module('angularCharts').factory('lineChart', function(Utils, Tooltips) {

    /**
     * Draws a line chart
     * @return {[type]} [description]
     */
    function lineChart(chart, scope, getColor) {
        var config = chart.config;
        var margin = {
            top: 0,
            right: 40,
            bottom: 20,
            left: 40
        };
        chart.width -= margin.left + margin.right;
        chart.height -= margin.top + margin.bottom;

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

        var line = d3.svg.line()
            .interpolate(config.lineCurveType)
            .x(function(d) {
                return getX(d.x);
            })
            .y(function(d) {
                return y(d.y);
            });

        var yData = [0];
        var linedata = [];

        chart.points.forEach(function(d) {
            d.y.map(function(e) {
                yData.push(e);
            });
        });

        var yMaxPoints = d3.max(chart.points.map(function(d) {
            return d.y.length;
        }));
        scope.yMaxData = yMaxPoints;
        chart.series.slice(0, yMaxPoints).forEach(function(value, index) {
            var d = {};
            d.series = value;
            d.values = chart.points.map(function(point) {
                return point.y.map(function(e) {
                    return {
                        x: point.x,
                        y: e,
                        tooltip: point.tooltip
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

        var point = svg.selectAll(".points")
            .data(linedata)
            .enter().append("g");

        var path = point.attr("points", "points")
            .append("path")
            .attr("class", "ac-line")
            .style("stroke", function(d, i) {
                return getColor(i);
            })
            .attr("d", function(d) {
                return line(d.values);
            })
            .attr("stroke-width", "2")
            .attr("fill", "none");

        /** Animation function
         * [last description]
         * @type {[type]}
         */
        if (linedata.length > 0) {
            var last = linedata[linedata.length - 1].values;
            if (last.length > 0) {
                var totalLength = path.node().getTotalLength() + getX(last[last.length - 1].x);

                path.attr("stroke-dasharray", totalLength + " " + totalLength)
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                    .duration(config.isAnimate ? 1500 : 0)
                    .ease("linear")
                    .attr("stroke-dashoffset", 0)
                    .attr("d", function(d) {
                        return line(d.values);
                    });
            }
        }

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
         * Labels at the end of line
         */
        if (config.lineLegend === 'lineEnd') {
            point.append("text")
                .datum(function(d) {
                    return {
                        name: d.series,
                        value: d.values[d.values.length - 1]
                    };
                })
                .attr("transform", function(d) {
                    return "translate(" + getX(d.value.x) + "," + y(d.value.y) + ")";
                })
                .attr("x", 3)
                .text(function(d) {
                    return d.name;
                });
        }

        /**
         * Returns x point of line point
         * @param  {[type]} d [description]
         * @return {[type]}   [description]
         */
        function getX(d) {
            return Math.round(x(d)) + x.rangeBand() / 2;
        }

        return linedata;
    }

    return lineChart;
})