angular.module('angularCharts').factory('pieChart', function(Tooltips) {

    /**
     * Draws a beautiful pie chart
     * @return {[type]} [description]
     */
    function pieChart(chart, scope, getColor) {
        var config = chart.config;
        var radius = Math.min(chart.width, chart.height) / 2;
        var svg = d3.select(chart.chartContainer[0]).append("svg")
            .attr("width", chart.width)
            .attr("height", chart.height)
            .append("g")
            .attr("transform", "translate(" + chart.width / 2 + "," + chart.height / 2 + ")");
        var innerRadius = 0;

        if (config.innerRadius) {
            var configRadius = config.innerRadius;
            if (typeof(configRadius) === 'string' && configRadius.indexOf('%') > 0) {
                configRadius = radius * (parseFloat(configRadius) * 0.01);
            } else {
                configRadius = Number(configRadius);
            }

            if (configRadius >= 0) {
                innerRadius = configRadius;
            }
        }

        scope.yMaxData = chart.points.length;

        var arc = d3.svg.arc()
            .outerRadius(radius - 10)
            .innerRadius(innerRadius);

        d3.svg.arc()
            .outerRadius(radius + 5)
            .innerRadius(0);

        var pie = d3.layout.pie()
            .sort(null)
            .value(function(d) {
                return d.y[0];
            });

        var path = svg.selectAll(".arc")
            .data(pie(chart.points))
            .enter().append("g");

        var complete = false;

        path.append("path")
            .style("fill", function(d, i) {
                return getColor(i);
            })
            .transition()
            .ease("linear")
            .duration(config.isAnimate ? 500 : 0)
            .attrTween("d", tweenPie)
            .attr("class", "arc")
            .each('end', function() {
                //avoid firing multiple times
                if (!complete) {
                    complete = true;

                    //Add listeners when transition is done
                    path.on("mouseover", function(d) {
                        Tooltips.makeToolTip(chart, scope, {
                            value: d.data.tooltip ? d.data.tooltip : d.data.y[0]
                        }, d3.event);
                        d3.select(this)
                            .select('path')
                            .transition()
                            .duration(200)
                            .style("stroke", "white")
                            .style("stroke-width", "2px");
                        config.mouseover(d, d3.event);
                        scope.$apply();
                    })
                        .on("mouseleave", function(d) {
                            d3.select(this)
                                .select('path')
                                .transition()
                                .duration(200)
                                .style("stroke", "")
                                .style("stroke-width", "");
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

                }
            });

        if (!!config.labels) {
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

    return pieChart;
})