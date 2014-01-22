var angularCharts = angularCharts || {};

/**
 * Draws a bar chart, grouped with negative value handling
 * @return {[type]} [description]
 */
angularCharts.barChart = function(chartContainer, helper) {
    var width = helper.getDimensions().width, height = helper.getDimensions().height || width;
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
    width -= margin.left + margin.right;
    height -= margin.top + margin.bottom;

    var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
            .range([height, 10]);

    var x0 = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);

    var yData = [0];

    helper.points.forEach(function(d) {
        d.nicedata = d.y.map(function(e, i) {
            yData.push(e);
            return {
                x: d.x,
                y: e,
                s: i
            };
        });
    });

    var yMaxPoints = d3.max(helper.points.map(function(d) {
        return d.y.length;
    }));

    x.domain(helper.points.map(function(d) {
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

    var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(10)
            .tickFormat(d3.format('s'));

    /**
     * Start drawing the chart!
     * @type {[type]}
     */
    var svg = d3.select(chartContainer[0]).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

    svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

    /**
     * Add bars
     * @type {[type]}
     */
    var barGroups = svg.selectAll(".state")
            .data(helper.points)
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
            .attr("y", height)
            .style("fill", function(d, i) {
                return helper.getColor(i);
            })
            .attr("height", 0)
            .transition()
            .ease("cubic-in-out")
            .duration(1000)
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
        helper.mouseover(arguments);
    })
            .on("mouseleave", function(d) {
                helper.mouseleave(arguments);
            })
            .on("mousemove", function(d) {
                helper.mousemove(arguments);
            })
            .on("click", function(d) {
                helper.click(arguments);
            });

    /**
     * Create labels
     */
    if (helper.showLabels) {
        barGroups.selectAll('not-a-class')
                .data(function(d) {
                    return d.nicedata;
                })
                .enter().append("text")
                .attr("x", function(d, i) {
                    return x0(i);
                })
                .attr("y", function(d) {
                    return height - Math.abs(y(d.y) - y(0));
                })
                .text(function(d) {
                    return d.y;
                });
    }

    /**
     * Draw one zero line in case negative values exist
     */
    svg.append("line")
            .attr("x1", width)
            .attr("y1", y(0))
            .attr("y2", y(0))
            .style("stroke", "silver");
};