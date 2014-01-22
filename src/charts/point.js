var angularCharts = angularCharts || {};

angularCharts.pointChart = function(chartContainer, width, height, points, config, scope) {
    var margin = {
        top: 0,
        right: 40,
        bottom: 20,
        left: 40
    };
    width -= margin.left - margin.right;
    height -= margin.top - margin.bottom;

    var x = d3.scale.ordinal()
            .domain(points.map(function(d) {
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

    var yData = [0];
    var linedata = [];

    points.forEach(function(d) {
        d.y.map(function(e, i) {
            yData.push(e);
        });
    });

    var yMaxPoints = d3.max(points.map(function(d) {
        return d.y.length;
    }));
    scope.yMaxPoints = yMaxPoints;

    series.slice(0, yMaxPoints).forEach(function(value, index) {
        var d = {};
        d.series = value;
        d.values = points.map(function(point) {
            return point.y.map(function(e) {
                return {
                    x: point.x,
                    y: e
                };
            })[index] || {
                x: points[index].x,
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
                    return getX(d.x)
                })
                .attr("cy", function(d) {
                    return y(d.y)
                })
                .attr("r", 3)
                .style("fill", getColor(linedata.indexOf(value)))
                .style("stroke", getColor(linedata.indexOf(value)))
                .on("mouseover", function(d) {
                    makeToolTip(d.tooltip || d.y);
                    config.mouseover(d);
                    scope.$apply();
                })
                .on("mouseleave", function(d) {
                    removeToolTip();
                    config.mouseout(d);
                    scope.$apply();
                })
                .on("mousemove", function(d) {
                    updateToolTip();
                })
                .on("click", function(d) {
                    config.click(d);
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
    ;
}