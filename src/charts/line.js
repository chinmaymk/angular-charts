var angularCharts = angularCharts || {};
/**
 * Draws a line chart
 * @return {[type]} [description]
 */
angularCharts.lineChart = function(chartContainer, helper) {
    var width = helper.getDimensions().width, height = helper.getDimensions().height || width;
    var margin = {
        top: 0,
        right: 40,
        bottom: 20,
        left: 40
    };
    width -= margin.left + margin.right;
    height -= margin.top + margin.bottom;

    var x = d3.scale.ordinal()
            .domain(helper.points.map(function(d) {
                return d.x;
            }))
            .rangeRoundBands([0, width]);

    var y = d3.scale.linear()
            .range([height, 10]);

    var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

    var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(5)
            .tickFormat(d3.format('s'));

    var line = d3.svg.line()
            .interpolate("cardinal")
            .x(function(d) {
                return getX(d.x);
            })
            .y(function(d) {
                return y(d.y);
            });

    var yData = [0];
    var linedata = [];

    helper.points.forEach(function(d) {
        d.y.map(function(e, i) {
            yData.push(e);
        });
    });

    var yMaxPoints = d3.max(helper.points.map(function(d) {
        return d.y.length;
    }));

    helper.series.slice(0, yMaxPoints).forEach(function(value, index) {
        var d = {};
        d.series = value;
        d.values = helper.points.map(function(point) {
            return point.y.map(function(e) {
                return {
                    x: point.x,
                    y: e
                };
            })[index] || {
                x: helper.points[index].x,
                y: 0
            };
        });
        linedata.push(d);
    });

    var svg = d3.select(chartContainer[0]).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var padding = d3.max(yData) * 0.20;

    y.domain([d3.min(yData), d3.max(yData) + padding]);

    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

    svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

    var point = svg.selectAll(".helper.points")
            .data(linedata)
            .enter().append("g");

    path = point.attr("helper.points", "helper.points")
            .append("path")
            .attr("class", "ac-line")
            .style("stroke", function(d, i) {
                return helper.getColor(i);
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
    var last = linedata[linedata.length - 1].values;
    var totalLength = path.node().getTotalLength() + getX(last[last.length - 1].x);

    path.attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(1500)
            .ease("linear")
            .attr("stroke-dashoffset", 0)
            .attr("d", function(d) {
                return line(d.values);
            });

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
                .style("fill", helper.getColor(linedata.indexOf(value)))
                .style("stroke", helper.getColor(linedata.indexOf(value)))
                .on("mouseover", function() {
                    helper.mouseover.call(helper, arguments);
                })
                .on("mouseleave", function() {
                    helper.mouseleave.call(helper, arguments);
                })
                .on("mousemove", function() {
                    helper.mousemove.call(helper, arguments);
                })
                .on("click", function() {
                    helper.click.call(helper, arguments);
                });


        if (helper.showLabels) {
            helper.points.append("text")
                    .attr("x", function(d) {
                        return getX(d.x);
                    })
                    .attr("y", function(d) {
                        return y(d.y);
                    })
                    .text(function(d) {
                        return d.y
                    });
        }
    });


    /**
     * Labels at the end of line
     */
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

    /**
     * Returns x point of line point
     * @param  {[type]} d [description]
     * @return {[type]}   [description]
     */
    function getX(d) {
        return Math.round(x(d)) + x.rangeBand() / 2;
    }
    ;

    return linedata;
}