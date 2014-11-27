angular.module('angularCharts').factory('areaChart', function(Utils) {

    /**
     * Creates a nice area chart
     * @return {[type]} [description]
     */
    function areaChart(chart, scope, getColor) {
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
            .rangePoints([0, chart.width]);

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

        d3.svg.line()
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

        /**
         * Important to set for legend
         * @type {[type]}
         */
        scope.yMaxData = yMaxPoints;

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

        var point = svg.selectAll(".points")
            .data(linedata)
            .enter().append("g");

        var area = d3.svg.area()
            .interpolate('basis')
            .x(function(d) {
                return getX(d.x);
            })
            .y0(function() {
                return y(0);
            })
            .y1(function(d) {
                return y(0 + d.y);
            });

        point.append("path")
            .attr("class", "area")
            .attr("d", function(d) {
                return area(d.values);
            })
            .style("fill", function(d, i) {
                return getColor(i);
            })
            .style("opacity", "0.7");

        function getX(d) {
            return Math.round(x(d)) + x.rangeBand() / 2;
        }
    }

    return areaChart;
})