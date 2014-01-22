var angularCharts = angularCharts || {};
/**
 * Draws a beautiful pie chart
 * @return {[type]} [description]
 */
angularCharts.pieChart = function(chartContainer, helper) {
    var width = helper.getDimensions().width, height = helper.getDimensions().height || width;
    var radius = Math.min(width, height) / 2;
    var svg = d3.select(chartContainer[0]).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var arc = d3.svg.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

    d3.svg.arc()
            .outerRadius(radius + 5)
            .innerRadius(0);

    var pie = d3.layout.pie()
            .sort(null)
            .value(function(d) {
                return d.y[0];
            });

    var path = svg.selectAll(".arc")
            .data(pie(helper.points))
            .enter().append("g");

    path.append("path")
            .style("fill", function(d, i) {
                return helper.getColor(i);
            })
            .transition()
            .ease("linear")
            .duration(500)
            .attrTween("d", tweenPie)
            .attr("class", "arc");

    path.on("mouseover", function(d) {
        d3.select(this)
                .select('path')
                .transition()
                .duration(200)
                .style("stroke", "white")
                .style("stroke-width", "2px");
        helper.mouseover(d.data.tooltip || d.value);
    })
            .on("mouseleave", function(d) {
                d3.select(this)
                        .select('path')
                        .transition()
                        .duration(200)
                        .style("stroke", "")
                        .style("stroke-width", "");
                helper.mouseleave(arguments);
            })
            .on("mousemove", function() {
                helper.mousemove(arguments);
            })
            .on("click", function() {
                helper.click(arguments);
            });

    if (!!helper.showLabels) {
        path.append("text")
                .attr("transform", function(d) {
                    return "translate(" + arc.centroid(d) + ")";
                })
                .attr("dy", ".35em")
                .style("text-anchor", "middle")
                .text(function(d) {
                    return d.data.y[0];
                });
    }

    function tweenPie(b) {
        b.innerRadius = 0;
        var i = d3.interpolate({
            startAngle: 0,
            endAngle: 0
        }, b);
        return function(t) {
            return arc(i(t));
        };
    }
}