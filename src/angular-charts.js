

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

  var colors = ['steelBlue', 'rgb(255,153,0)', 'rgb(220,57,18)', 'rgb(70,132,238)', 'rgb(73,66,204)', 'rgb(0,128,0)'];

  var config = {
    title : '',
    tooltips: true,
    labels : false,
    mouseover: function() {},
    mouseout: function() {},
    click: function() {},
    legend: {
      display: true,
      //could be 'left, right'
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
    var data, 
    series, 
    points, 
    height, 
    width, 
    chartContainer, 
    legendContainer, 
    chartType,
    isAnimate =true;

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
      chartType = scope[attrs.acChart];
      prepareData();
      setHeightWidth();
      setContainers()
      var chartFunc = getChartFunction(chartType);
      chartFunc();
      drawLegend();
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
      element.html($compile(container)(scope));
      chartContainer = element.find('.ac-chart');
      legendContainer = element.find('.ac-legend');
      height -= element.find('.ac-title').height();
    }

    /**
     * Parses data from attributes 
     * @return {[type]} [description]
     */
    function prepareData() {
      series = data.series;
      points = data.data;
      if(!!scope[attrs.acConfig]) {
        angular.extend(config, scope[attrs.acConfig]);
        scope.config = config;
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

    /**
     * Draws a bar chart, grouped with negative value handling
     * @return {[type]} [description]
     */
    function barChart() {
      /**
       * Setup date attributes
       * @type {Object}
       */
      var margin = {top: 0, right: 20, bottom: 30, left: 40};
          width -=  margin.left - margin.right;
          height -= margin.top - margin.bottom;

      var x = d3.scale.ordinal()
          .rangeRoundBands([0, width], .1);

      var y = d3.scale.linear()
          .range([height, 10]);
      
      var x0 = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

      var yData = [0];

      points.forEach(function(d) {
        d.nicedata = d.y.map(function(e, i) {
          yData.push(e);
          return {
            x : d.x,
            y : e,
            s : i
          }
        })
      })

      var yMaxPoints = d3.max(points.map(function(d){ return d.y.length; }));

      scope.yMaxData = yMaxPoints;

      x.domain(points.map(function(d) { return d.x; }));
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
          .ticks(10);

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
          .data(points)
        .enter().append("g")
          .attr("class", "g")
          .attr("transform", function(d) { return "translate(" + x(d.x) + ",0)"; });

      var bars = barGroups.selectAll("rect")
          .data(function(d) { return d.nicedata; })
        .enter().append("rect");
          
      bars.attr("width", x0.rangeBand())
      bars.attr("x", function(d, i) { return x0(i); })
          .attr("y", height)
          .style("fill", function(d) { return getColor(d.s); })
          .attr("height", 0)
        .transition()
          .ease("cubic-in-out")
          .duration(1000)
          .attr("y", function(d) { return y(Math.max(0, d.y)); })
          .attr("height", function(d) { return Math.abs(y(d.y) - y(0)); });
        
        /**
         * Add events for tooltip
         * @param  {[type]} d [description]
         * @return {[type]}   [description]
         */
        bars.on("mouseover", function(d) { 
          makeToolTip(d.tooltip || d.y, event);
        })
        .on("mouseleave", function(d) {  
          removeToolTip();
        })
        .on("mousemove", function(d) {  
           updateToolTip(event);
        });

        /**
         * Create labels
         */
        barGroups.selectAll('not-a-class')
          .data(function(d){ return d.nicedata; })
        .enter().append("text")
          .attr("x", function(d, i) { return x0(i); })
          .attr("y", function(d) { return height - Math.abs(y(d.y) - y(0)); })
          // .attr("transform", "rotate(270)")
          .text(function(d) {return d.y; });  

      /**
       * Draw one zero line in case negative values exist
       */
      svg.append("line")
        .attr("x1", width)
        .attr("y1", y(0))
        .attr("y2", y(0))
        .style("stroke", "silver");
    }

    /**
     * Draws a line chart
     * @return {[type]} [description]
     */
    function lineChart() {
      var margin = {top: 0, right: 40, bottom: 20, left: 40};
          width -= margin.left - margin.right;
          height -=  margin.top - margin.bottom;

      var x = d3.scale.ordinal()
            .rangeRoundBands([0, width])
            .domain(points.map(function(d) { return d.x; }));

      var y = d3.scale.linear()
          .range([height, 10]);

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

      var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .ticks(5);

      var line = d3.svg.line()
          .x(function(d) { return x(d.x); })
          .y(function(d) { return y(d.y); });

      var yData = [0];
      var linedata = [];

      points.forEach(function(d) {
        d.y.map(function(e, i) {
          yData.push(e);
        })
      })

      var yMaxPoints = d3.max(points.map(function(d){ return d.y.length; }));

      series.slice(0, yMaxPoints).forEach(function(value, index) {
        var d = {};
        d.series = value;
        d.values = points.map(function(point){
          return point.y.map(function(e) {
            return {
              x : point.x,
              y : e
            }
          })[index] || {x:points[index].x, y :0};
        });
        linedata.push(d);
      });

      console.log(linedata);

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

      var startvalueline2 = d3.svg.line()
            .x(function(d) { return x(x.domain()[0]); })
            .y(function(d) { return y(0); })

      point.attr("points", "points")
        .append("path")
        .attr("class", "ac-line")
        .style("stroke", function(d,i) { return getColor(i); })
        .attr("d", function(d) { return startvalueline2(d.values) })
        .transition()
        .ease("linear")
        .duration(500)
        .attr("d", function(d) { return line(d.values) })
      
      point.on("mouseover", function(d) {
          makeToolTip(d.series, event);
      });
      point.on("mouseleave", function(d) {
          removeToolTip();
      });
      point.on("mousemove", function(d) {
          updateToolTip(event);
      });
      
      point.append("text")
        .datum(function(d) { return {name: d.series, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.value.x) + "," + y(d.value.y) + ")"; })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; });
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

      scope.yMaxData = points.length;

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
                    .ease("linear")
                    .duration(500)
                    .attrTween("d", tweenPie)
                    .attr("class", "arc")
      path.on("mouseover", function(d) { 
        makeToolTip(d.data.tooltip || d.data.y[0]);
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
            removeToolTip();
      })
      .on("mousemove", function(d) {  
          updateToolTip(event);
      });

      if(!!config.labels) {
        path.append("text")
          .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
          .attr("dy", ".35em")
          .style("text-anchor", "middle")
          .text(function(d) { return d.data.y[0]; });  
      }

      function tweenPie(b) {
        b.innerRadius = 0;
        var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
        return function(t) {
          return arc(i(t));
        };
      }
    }

    /**
     * Creates and displays tooltip
     * @return {[type]} [description]
     */
    function makeToolTip(data, event) {
      if(!config.tooltips) {
        return;
      }
      angular.element('<p class="ac-tooltip" style="' + tooltip + '"></p>')
          .html(data)
          .appendTo('body')
          .fadeIn('slow')
          .css({left: event.pageX + 20, top: event.pageY - 30});
    }

    /**
     * Clears the tooltip from body
     * @return {[type]} [description]
     */
    function removeToolTip() {
      angular.element('.ac-tooltip').remove();
    }

    function updateToolTip(event) {
      angular.element('.ac-tooltip').css({left: event.pageX + 20, top: event.pageY - 30});
    }

    /**
     * Adds data to legend
     * @return {[type]} [description]
     */
    function drawLegend() {
      scope.legends = [];
      if(chartType == 'pie') {
        angular.forEach(points, function(value, key){
          scope.legends.push({color : colors[key], title: value.x});
        });
      }
      if(chartType == 'bar') {
        angular.forEach(series, function(value, key){
          scope.legends.push({color : colors[key], title: value});
        }); 
      }
    }

    /**
     * Checks if index is available in color 
     * else returns a random color
     * @param  {[type]} i [description]
     * @return {[type]}   [description]
     */
    function getColor(i) {
      if(i < colors.length) {
        return colors[i]
      } else {
        var color = getRandomColor();
        colors.push(color);
        return color;
      }
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
    scope.$watch(attrs.acConfig, function(){ isAnimate = false; init(); }, true);
  }

  return {
    restrict:'EA',
    link : link
  } 
});