

/**
 * Main module
 */
 angular.module('angularCharts', []);

/**
 * Pie chart
 */
 angular.module('angularCharts').directive('pieChart', function(){
  return {
    restrict:'EA',
    link : function(scope, element, attrs) {
      var width = 960,
      height = 500,
      radius = Math.min(width, height) / 2;
      var data;
      console.log(attrs.pieChart);
      scope.$watch(attrs.pieChart, function(){
        data = scope.data;
        drawChart();
      }, true);

      var color = d3.scale.ordinal()
      .range(['rgb(255,153,0)', 'rgb(220,57,18)', 'rgb(70,132,238)', 'rgb(73,66,204)', 'rgb(0,128,0)']);

      var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

      function drawChart() {
        element.html('');

        var svg = d3.select(element[0]).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        
        var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d; });

        var path = svg.selectAll(".arc")
        .data(pie(data))
        .enter().append("g");

        path.transition()
        .ease("elastic")
        .duration(2000)
        .attrTween("d", arcTween)
        .attr("class", "arc");

        path.append("path")
        .attr("d", arc)
        .style("fill", function(d, i) { return color(i); })
        .on("mouseover", function(d) { return d.data; });

        path.append("text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(function(d) { return d.data; });
      }

      function arcTween(b) {
        var i = d3.interpolate({value: b.previous}, b);
        return function(t) {
          return arc(i(t));
        };
      }
    //drawChart();
  }
}
});