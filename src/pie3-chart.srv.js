angular.module('angularCharts').factory('pie3Chart', function(Tooltips) {

    var  getPath = function(cx, cy, rx, ry, startA, endA, depth) {

        // Rotate angles

        var start = startA - Math.PI/4;
        var end = endA - Math.PI/4;

        if(start <= 0 && end <= 0) {
                start += Math.PI*2;
                end += Math.PI*2;
        }

        var x1 = Math.sin(start) * rx + cx;
        var y1 = Math.cos(start) * ry + cy;

        var x2 = Math.sin(end) * rx + cx;
        var y2 = Math.cos(end) * ry + cy;

        var d = " M" + cx +"," + cy;
        d += " L" + x1 +"," + y1;
        d += " A" + rx + "," + ry + " 0 "+ (Math.abs(start-end)>Math.PI?1:0) + ",0 " + x2 + "," + y2;
        d += " L" + cx+"," + cy;

        if( start <= Math.PI/2) {
            d += " M" + x1 + "," + y1;
            d += " L" + x1 + "," + (y1+depth);
            if(end<=Math.PI/2) {
                d += " A" + rx + "," + ry + " 0 0,0 " + x2+"," + (y2+depth);
                d += " L" + x2+"," + y2;
                d += " A" + rx + "," + ry + " 0 0,1 " + x1+"," + y1;
            } else  {
                var xx = cx + rx;
                var yy = cy;
                d += " A" + rx + "," + ry + " 0 0,0 " + xx + "," + (yy+depth);
                d += " L" + xx+"," + yy;
                d += " A" + rx + "," + ry + " 0 0,1 " + x1 + "," + y1;
            }
        }

        if (end >= Math.PI*1.5) { // 270
            d += " M" + x2 + "," + y2;
            d += " L" + x2 + "," + (y2+depth);
            if(start < Math.PI*1.5) {
                var xx = cx - rx;
                var yy = cy;
                d += " A" + rx + "," + ry + " 0 0,1 " + xx + "," + (yy+depth);
                d += " L" + xx+"," + yy;
                d += " A" + rx + "," + ry + " 0 0,0 " + x2 + "," + y2;
            } else {
                d += " A" + rx + "," + ry  + " 0 0,1 " + x1 + "," + (y1+depth);
                d += " L" + x1 + "," + y1;
                d += " A" + rx + "," + ry + " 0 0,0 " + x2 + "," + y2;
            }
        }
        return d;
    }


/**
     * Draws a beautiful pie chart
     * @return {[type]} [description]
     */
    function pie3Chart(chart, scope, getColor) {

        var depth = chart.config.depth || 20;

        var h0 = Math.min(chart.height-depth, chart.width * 0.5-depth) / 2;

        var cx = chart.width / 2;
        var cy = h0;

        var rx = chart.width / 2 - 2;
        var ry = h0 - 2;

        var svg = d3.select(chart.chartContainer[0]).append("svg")
            .attr("width", chart.width)
            .attr("height", chart.height);

        var defs = svg.append('defs');
        var grad1 = defs.append('linearGradient')
            .attr('id','grad1')
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1','0%')
            .attr('y1','0%')
            .attr('x2','0%')
            .attr('y2','100%');

            angular.forEach([
                {opacity: '.2', color: "#333333", offset: '20%'},
                {opacity: '.3', color: "#DDDDDD", offset: '60%'}
            ], function (s, key) {
                grad1.append('stop')
                    .attr('stop-opacity', s.opacity)
                    .attr('stop-color', s.color)
                    .attr('offset', s.offset);
            });

        var grad2 = defs.append('linearGradient')
            .attr('id','grad2')
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1','0%')
            .attr('y1','0%')
            .attr('x2','100%')
            .attr('y2','0%');

        angular.forEach([
            {opacity: '.8', color: "#333333", offset: '0%'},
            {opacity: '.6', color: "#AAAAAA", offset: '20%'},
            {opacity: '.4', color: "#AAAAAA", offset: '50%'},
            {opacity: '.6', color: "#AAAAAA", offset: '80%'},
            {opacity: '.8', color: "#333333", offset: '100%'}
        ], function (s, key) {
            grad2.append('stop')
                .attr('stop-opacity', s.opacity)
                .attr('stop-color', s.color)
                .attr('offset', s.offset);
        });

        var colors      = svg.append('g');
        var shades      = svg.append('g');
        var interactive = svg.append('g');


    shades.append('ellipse')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('rx', rx)
        .attr('ry', ry)
        .attr('fill', 'url(#grad1)')

    var d = "M " + (cx-rx) +"," + cy + 'A '+ rx + ',' + ry + ' 0 0,0 ' + (cx+rx) + ' , ' + cy + ' L ' + (cx+rx) + ' , ' + (cy + depth) + ' A ' + rx + ' , ' + ry + ' 0 0,1 ' + (cx-rx) + ', ' + (cy + depth) + ' L ' + (cx-rx) + ', ' + cy;

    shades.append('path')
        .attr('d', d)
        .attr('fill', 'url(#grad2)');

    var values = [];
    var total = 0;
    angular.forEach(chart.points, function (v, i) {
        values.push(v.y[0]);
        total += v.y[0];
    });

    ang = values.map(function (v, i) {
        return  v / total * Math.PI*2;
    });

    var start = [0];
    angular.forEach(ang, function(v, i){
        start.push(v + start[i]);
    });

    angular.forEach(chart.points, function(v, i){
        colors.append('path')
            .attr('fill', getColor(i))
            .attr('stroke', getColor(i))
            .attr('d', getPath(cx, cy, rx, ry, start[i], start[i]+ang[i], depth));

        var segment = interactive.append('path')
            .attr('fill', 'rgba(255,255,255,0)')
            .attr('d', getPath(cx, cy, rx, ry, start[i], start[i]+ang[i], depth));

        //Add listeners when transition is done
        segment.on("mouseover", function(d) {
            Tooltips.makeToolTip(chart, scope, {
                value: v.tooltip ? v.tooltip : v.y[0]
            }, d3.event);
            d3.select(this)
                .transition()
                .duration(200)
                .attr('fill', 'rgba(255,255,255,0.5)')
                .style("stroke", "black")
                .style("stroke-width", "2px");
            chart.config.mouseover(v, d3.event);
            scope.$apply();
        })
            .on("mouseleave", function(d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('fill', 'rgba(255,255,255,0)')
                    .style("stroke", "")
                    .style("stroke-width", "");

                Tooltips.removeToolTip(scope);
                chart.config.mouseout(v, d3.event);
                scope.$apply();
            })
            .on("mousemove", function(d) {
                Tooltips.updateToolTip(scope, v, d3.event);
            })
            .on("click", function(d) {
                chart.config.click(v, d3.event);
                scope.$apply();
            });


    });



    /*

    scope.yMaxData = chart.points.length;

    var segments = colors.data(chart.points);

    segments.enter().append('path')
        .attr('fill', function(d, i){return getColor(i);})
        .attr('d', function(d, i){
            return
        });


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
        .duration(chart.config.isAnimate ? 500 : 0)
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
                    chart.config.mouseover(d, d3.event);
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
                        chart.config.mouseout(d, d3.event);
                        scope.$apply();
                    })
                    .on("mousemove", function(d) {
                        Tooltips.updateToolTip(scope, d, d3.event);
                    })
                    .on("click", function(d) {
                        chart.config.click(d, d3.event);
                        scope.$apply();
                    });

            }
        });

    if (!!chart.config.labels) {
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

    */
    }

    return pie3Chart;
})