var angularCharts = angularCharts || {};

/**
 * Creates a nice area chart
 * @return {[type]} [description]
 */
angularCharts.areaChart = function(chartContainer, helper) {
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

    var point = svg.selectAll(".points")
            .data(linedata)
            .enter().append("g");

    var area = d3.svg.area()
            .interpolate('basis')
            .x(function(d) {
                return getX(d.x);
            })
            .y0(function(d) {
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
                return helper.getColor(i);
            })
            .style("opacity", "0.7");

    function getX(d) {
        return Math.round(x(d)) + x.rangeBand() / 2;
    }
    ;
}