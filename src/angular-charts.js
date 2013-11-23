

/**
* Main module
*/
angular.module('angularCharts', ['angularChartsTemplates']);

/**
* Main directive handling drawing of all charts
*/
angular.module('angularCharts').directive('acChart', function($templateCache, $compile, $window) {

  /**
   * Initialize some constants
   * @type {Array}
   */
  var tooltip = ["display:none;",
                "position:absolute;",
                "border:1px solid #333;",
                "background-color:#161616;",
                "border-radius:5px;",
                "padding:5px;",
                "color:#fff;"].join('');

  var colors = ['rgb(255,153,0)', 'rgb(220,57,18)', 'rgb(70,132,238)', 'rgb(73,66,204)', 'rgb(0,128,0)'];

  var config = {
    title : '',
    tooltips: true,
    labels : false,
    mouseover: function() {},
    mouseout: function() {},
    click: function() {},
    legend: {
      display: true,
      //could be 'left, right, top, bottom'
      position: 'left'
    }
  }
  /**
   * Utility function to call when we run out of colors!
   * @return {[type]} [description]
   */
  function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
      color += letters[Math.round(Math.random() * 15)];
    }
    return color;
  }

  /**
   * Main link function
   * @param  {[type]} scope   [description]
   * @param  {[type]} element [description]
   * @param  {[type]} attrs   [description]
   * @return {[type]}         [description]
   */
  function link(scope, element, attrs) {
    var totalWidth = element.width(), totalHeight = element.height();
    var data, series, points, height, width, chartContainer, legendContainer;

    /**
     * All the magic happens here
     * handles extracting chart type
     * getting data
     * validating data
     * drawing the chart
     * @return {[type]} [description]
     */
    function init() {
      data = scope[attrs.acData];
      prepareData();
      setHeightWidth();
      setContainers()
      var chartFunc = getChartFunction(attrs.acChart);
      chartFunc();
    }

    /**
     * Sets height and width of chart area based on legend
     * used for setting radius, bar width of chart
     */
    function setHeightWidth() {
      if(!config.legend.display) {
        height = totalHeight;
        width = totalWidth;
        return;
      }
      switch(config.legend.position) {
        case 'top':
        case 'bottom':
              height = totalHeight * 0.75;
              width = totalWidth;
              break;
        case 'left':
        case 'right':
              height = totalHeight;
              width = totalWidth * 0.75;
              break;
      }
    } 

    /**
     * Creates appropriate DOM structure for legend + chart
     */
    function setContainers() {
      var container = $templateCache.get(config.legend.position);
      element.html(container);
      chartContainer = element.find('.ac-chart');
      legendContainer = element.find('.ac-legend');
      legendContainer.html("<h1>Hello World</h1>");
    }

    function prepareData() {
      series = data.series;
      points = data.data;
      if(!!scope[attrs.acConfig]) {
        angular.extend(config, scope[attrs.acConfig]);
      }
    }

    /**
     * Returns appropriate chart function to call
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */
    function getChartFunction(type) {
      var charts = {
        'pie' : pieChart,
        'bar' : barChart,
        'line': lineChart,
        'area': areaChart
      }
      return charts[type];
    }

    function barChart() {

    }

    function lineChart() {
        
    }

    function areaChart() {
        
    }

    /**
     * Draws a beautiful pie chart
     * @return {[type]} [description]
     */
    function pieChart() {
      var radius = Math.min(width, height) / 2;
      var svg = d3.select(chartContainer[0]).append("svg")
                  .attr("width", width)
                  .attr("height", height)
                  .append("g")
                  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      var arc = d3.svg.arc()
                  .outerRadius(radius - 10)
                  .innerRadius(0);

      var arcOver = d3.svg.arc()
                      .outerRadius(radius + 5)
                      .innerRadius(0);

      var pie = d3.layout.pie()
                  .sort(null)
                  .value(function(d) { return d.y[0]; });

      var path = svg.selectAll(".arc")
                    .data(pie(points))
                    .enter().append("g");

      var arcs = path.append("path")
                    .style("fill", function(d, i) { return getColor(i); })
                    .transition()
                    .duration(500)
                    .attr("d", arc)
                    .attr("class", "arc");

      path.on("mouseover", function(d) { 
        angular.element('<p class="ac-tooltip" style="' + tooltip + '"></p>')
              .html(d.data.tooltip || d.data.y[0])
              .appendTo('body')
              .fadeIn('slow')
              .css({left: event.pageX + 20, top: event.pageY - 30});

      d3.select(this)
          .select('path')
          .transition()
          .duration(200)
          .style("stroke", "white")
          .style("stroke-width", "2px");
      })
      .on("mouseleave", function(d) {  
        d3.select(this)
          .select('path')
          .transition()
          .duration(200)
          .style("stroke", "")
          .style("stroke-width", "");
          angular.element('.ac-tooltip').remove();
      })
      .on("mousemove", function(d) {  
        angular.element('.ac-tooltip').css({left: event.pageX + 20, top: event.pageY - 30});
      });

      if(!!config.labels) {
        path.append("text")
          .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
          .attr("dy", ".35em")
          .style("text-anchor", "middle")
          .text(function(d) { return d.data.y[0]; });  
      }
    }

    /**
     * Checks if index is available in color 
     * else returns a random color
     * @param  {[type]} i [description]
     * @return {[type]}   [description]
     */
    function getColor(i) {
        return colors[i] || getRandomColor();
    }

    var w = angular.element($window);
    scope.getWindowDimensions = function () {
        return { 'h': w.height(), 'w': w.width() };
    };
    // let the party being!
    //init();
    //add some watchers
    scope.$watch(attrs.acChart, function(){ init(); }, true);
    scope.$watch(attrs.acData, function(){ init(); }, true);
  }

  return {
    restrict:'EA',
    link : link
  } 
});