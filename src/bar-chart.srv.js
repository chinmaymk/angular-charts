angular.module('angularCharts').factory('barChart', function(Utils, Tooltips) {

    /**
     * Draws a bar chart, grouped with negative value handling
     * @return {[type]} [description]
     */
    function barChart(chart, scope, getColor) {
        var config = chart.config;

        /**
         * Setup date attributes
         * @type {Object}
         */
        var margin = {
            top: 0,
            right: 20,
            bottom: 30,
            left: 40
        };
        chart.width -= margin.left + margin.right;
        chart.height -= margin.top + margin.bottom;

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, chart.width], 0.1);

        var y = d3.scale.linear()
            .range([chart.height, 10]);

        var x0 = d3.scale.ordinal()
            .rangeRoundBands([0, chart.width], 0.1);

        var yData = [0];

        chart.points.forEach(function(d) {
            d.nicedata = d.y.map(function(e, i) {
                yData.push(e);
                return {
                    x: d.x,
                    y: e,
                    s: i,
                    tooltip: angular.isArray(d.tooltip) ? d.tooltip[i] : d.tooltip
                };
            });
        });

        var yMaxPoints = d3.max(chart.points.map(function(d) {
            return d.y.length;
        }));

        scope.yMaxData = yMaxPoints;

        x.domain(chart.points.map(function(d) {
            return d.x;
        }));
        var padding = d3.max(yData) * 0.20;

        y.domain([d3.min(yData), d3.max(yData) + padding]);

        x0.domain(d3.range(yMaxPoints)).rangeRoundBands([0, x.rangeBand()]);

        /**
         * Create scales using d3
         * @type {[type]}
         */
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
        Utils.filterXAxis(chart, xAxis, x);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(10)
            .tickFormat(d3.format(config.yAxisTickFormat));

        /**
         * Start drawing the chart!
         * @type {[type]}
         */
        var svg = d3.select(chart.chartContainer[0]).append("svg")
            .attr("width", chart.width + margin.left + margin.right)
            .attr("height", chart.height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + chart.height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        /**
         * Add bars
         * @type {[type]}
         */
        var barGroups = svg.selectAll(".state")
            .data(chart.points)
            .enter().append("g")
            .attr("class", "g")
            .attr("transform", function(d) {
                return "translate(" + x(d.x) + ",0)";
            });

        var bars = barGroups.selectAll("rect")
            .data(function(d) {
                return d.nicedata;
            })
            .enter().append("rect");

        bars.attr("width", x0.rangeBand());

        bars.attr("x", function(d, i) {
            return x0(i);
        })
            .attr("y", chart.height)
            .style("fill", function(d) {
                return getColor(d.s);
            })
            .attr("height", 0)
            .transition()
            .ease("cubic-in-out")
            .duration(config.isAnimate ? 1000 : 0)
            .attr("y", function(d) {
                return y(Math.max(0, d.y));
            })
            .attr("height", function(d) {
                return Math.abs(y(d.y) - y(0));
            });
        /**
         * Add events for tooltip
         * @param  {[type]} d [description]
         * @return {[type]}   [description]
         */
        bars.on("mouseover", function(d) {

            Tooltips.makeToolTip(chart, scope, {
                index: d.x,
                value: d.tooltip ? d.tooltip : d.y,
                series: chart.series[d.s]
            }, d3.event);

            config.mouseover(d, d3.event);
            scope.$apply();
        })
            .on("mouseleave", function(d) {
                Tooltips.removeToolTip(scope);
                config.mouseout(d, d3.event);
                scope.$apply();
            })
            .on("mousemove", function(d) {
                Tooltips.updateToolTip(scope, d, d3.event);
            })
            .on("click", function(d) {
                config.click.call(d, d3.event);
                scope.$apply();
            });

        /**
         * Create labels
         */
        if (config.labels) {
            barGroups.selectAll('not-a-class')
                .data(function(d) {
                    return d.nicedata;
                })
                .enter().append("text")
                .attr("x", function(d, i) {
                    return x0(i);
                })
                .attr("y", function(d) {
                    return chart.height - Math.abs(y(d.y) - y(0));
                })
                // .attr("transform", "rotate(270)")
                .text(function(d) {
                    return d.y;
                });
        }

        /**
         * Draw one zero line in case negative values exist
         */
        svg.append("line")
            .attr("x1", chart.width)
            .attr("y1", y(0))
            .attr("y2", y(0))
            .style("stroke", "silver");
    }

    return barChart;
});


