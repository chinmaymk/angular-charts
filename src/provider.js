/**
 * Singleton Chart Logic
 *
 * Provides an API for customizing and adding charts at the application level
 */
 angular.module('angularCharts').provider('acChartLogic', function(){
  
  /**
   * Provider object
   *
   * @access private
   * @type {Object}
   */
  var acChartLogicProvider = {};

  /**
   * Stores chart functions
   *
   * @access private
   * @type {Object}
   */
  var chartFunctions = {};
  
  /**
   * angular $injector service
   * Set when acChartLogic is injected into directive
   *
   * @access private
   */
  var injector;

  /**
   * Beautiful default colors
   *
   * @type {Array}
   */
  var defaultColors = [
    'rgb(255,153,0)',
    'rgb(220,57,18)',
    'rgb(70,132,238)',
    'rgb(73,66,204)',
    'rgb(0,128,0)',
    'rgb(0, 169, 221)',
    'steelBlue',
    'rgb(0, 169, 221)',
    'rgb(50, 205, 252)',
    'rgb(70,132,238)',
    'rgb(0, 169, 221)',
    'rgb(5, 150, 194)',
    'rgb(50, 183, 224)',
    'steelBlue',
    'rgb(2, 185, 241)',
    'rgb(0, 169, 221)',
    'steelBlue',
    'rgb(0, 169, 221)',
    'rgb(50, 205, 252)',
    'rgb(70,132,238)',
    'rgb(0, 169, 221)',
    'rgb(5, 150, 194)',
    'rgb(50, 183, 224)',
    'steelBlue',
    'rgb(2, 185, 241)'
  ];

  /**
   * HTML Character replacement map
   *
   * @type {Object}
   */
  var HTML_ENTITY_MAP = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

  /**
   * Utility function to check if parameter is $injector.invoke() able
   * 
   * @access private
   * @param {Function || array} subject
   * @return {Boolean}
   */
  function isInvokable(subject){
    var response = false;
    
    if(typeof subject == 'function' 
      || ( ( typeof subject == 'array' || typeof subject == 'object' ) 
            && typeof subject[subject.length - 1] == 'function') )
      response = true;


    return response;
  }

  /**
   * Public API when injected into anything but the module config
   *
   * @return {Object}
   */
  acChartLogicProvider.$get = ['$injector', function($injector){

      //Provides usable version of injector to acChartLogicProvider
      injector = $injector;

      return {
      /**
       * Invokes chart function injecting acChartLogicProvider as this
       * @access public
       */
      callChartFunction: function (type, config, box, domFunctions, series, points){
        // == null will catch undefined while === will not
        if(type == null || config == null || box == null || domFunctions == null || series == null || points == null)
          throw new Error('Missing Parameter(s) expects (string type, object config, object box, object domFunctions, array series, array points)');

        if(!chartFunctions.hasOwnProperty(type))
          throw new Error('Chart type "'+type+'" does not exist');

        var localInjections = {
          config: config,
          box: box,
          domFunctions: domFunctions,
          series: series,
          points: points
        };

        $injector.invoke(chartFunctions[type].chart, acChartLogicProvider, localInjections);

        //Blank legends before calling function
        box.legends = [];
        $injector.invoke(chartFunctions[type].legend, acChartLogicProvider, localInjections);
      },

      /**
       * Retrieves default color list
       *
       * @return {Array}
       */
      getDefaultColors: function(){
        return defaultColors;
      }
    };
  }];

  /**
   * Set default colors
   *
   * @param {Array} list
   * @return acChartLogicProvider
   */
  acChartLogicProvider.setDefaultColors = function(list) {
    if(!Array.isArray(list))
      throw new Error('setDefaultColors expects an array');

    defaultColors = list;

    return acChartLogicProvider;
  };

  /**
   * Utility function to call when we run out of colors!
   * @access config
   * @return {String} Hexadecimal color
   */
  acChartLogicProvider.getRandomColor = function () {
    var r = (Math.round(Math.random() * 127) + 127).toString(16);
    var g = (Math.round(Math.random() * 127) + 127).toString(16);
    var b = (Math.round(Math.random() * 127) + 127).toString(16);
    return '#' + r + g + b;
  }

  /**
   * Used to add chart functions by type
   * @access config
   * @return {Object} acChartLogicProvider
   */
  acChartLogicProvider.addChart = function (type, chartFunction, legendFunction){
    if(!isInvokable(chartFunction)){
        throw new Error('addChart expects parameter 2 to be function');
    }

    if(legendFunction != null && !isInvokable(legendFunction)){
        throw new Error('addChart expects parameter 3 if set to be function');
      }
    
    chartFunctions[type] = {
      chart: chartFunction,
      legend: (legendFunction != null)? legendFunction : acChartLogicProvider.defaultLegend
    };

    return acChartLogicProvider;
  };

  /**
   * Checks if index is available in color
   * else returns a random color
   *
   * @access config
   * @param  {[type]} i [description]
   * @return {[type]}   [description]
   */
  acChartLogicProvider.getColor = function (config, i) {
    if (i < config.colors.length) {
      return config.colors[i];
    } else {
      var color = acChartLogicProvider.getRandomColor();
      config.colors.push(color);
      return color;
    }
  }

  /**
   * Default Legend
   *
   * @access config
   */
  acChartLogicProvider.defaultLegend = function (config, box, series, points){
    var acChartLogicProvider = this;

    angular.forEach(series, function(value, key) {
      box.legends.push({
        color: config.colors[key],
        title: acChartLogicProvider.getBindableTextForLegend(config, value)
      });
    });
  };

  /**
   * Make defaultLegend injectable
   */
  acChartLogicProvider.defaultLegend['$inject'] = ['config', 'box', 'series', 'points'];

  /**
   * Escapes html to safe characters
   *
   * @access config
   * @param {String} string
   * @return {String}
   */
  acChartLogicProvider.escapeHtml = function (string) {
    return String(string).replace(/[&<>"'\/]/g, function(char) {
      return HTML_ENTITY_MAP[char];
    });
  }

  /**
   * Gets text for legend label
   *
   * @access config
   * @param {Object} config
   * @param {String} text
   * @return {String}
   */
  acChartLogicProvider.getBindableTextForLegend = function (config, text) {
    var $sce = injector.get('$sce');

    return $sce.trustAsHtml(config.legend.htmlEnabled ? text : acChartLogicProvider.escapeHtml(text));
  }

  /**
   * Binds domFunctions to events
   * @access config
   * @param {Object} config
   * @param {Object} domFunctions
   * @param {d3.selection} selection
   * @param {object} tooltipConfig
   */
  acChartLogicProvider.bindTooltipEvents = function (config, domFunctions, selection){
    selection.on("mouseover", function(d) {
      domFunctions.makeToolTip({
        index: d.x,
        value: d.tooltip ? d.tooltip : d.y,
        series: d.series
      }, d, d3.event);
    })
    .on("mouseleave", function(d) {
      domFunctions.removeToolTip();
    })
    .on("mousemove", function(d) {
      domFunctions.updateToolTip(d, d3.event);
    })
    .on("click", function(d) {
      domFunctions.click(d, d3.event);
    });
  };

  acChartLogicProvider.applyMargins = function (box){
    box.width -= box.margin.left + box.margin.right;
    box.height -= box.margin.top + box.margin.bottom;
  };

  acChartLogicProvider.getYMaxPoints = function (points){
    return d3.max(points.map(function(d) { return d.y.length; }));
  };

  /**
   * Gets yData and sets nicedata
   *
   * @param {Array} points
   * @param {Array} series - for series string in nicedata
   * @return {Array} yData;
   */
  acChartLogicProvider.getYData = function(points, series){
    var yData = [0];

    points.forEach(function(d){
      d.nicedata = d.y.map(function(e, i) {
        yData.push(e);
        var nicedata = {
          x: d.x,
          y: e,
          s: i,
          tooltip: angular.isArray(d.tooltip) ? d.tooltip[i] : d.tooltip
        };
        if(series != null){
          nicedata.series = series[i];
        }
        return nicedata;
      });
    });

    return yData;
  }

  /**
   * Draw SVG element
   *
   * @param {Array} box
   * @return {d3.selection}
   */
  acChartLogicProvider.getSvg = function(box){
    return d3.select(box.chartContainer[0]).append("svg")
      .attr("width", box.width + box.margin.left + box.margin.right)
      .attr("height", box.height + box.margin.top + box.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + box.margin.left + "," + box.margin.top + ")")
    ;
  }

  /**
   * Get LineData
   */
  acChartLogicProvider.getLineData = function(points, series){
    var lineData = [];
    series.slice(0, this.getYMaxPoints(points)).forEach(function(value, index) {
      var d = {};
      d.series = value;
      d.values = points.map(function(point) {

        if(point.nicedata[index] != null)
          return point.nicedata[index];
        else
          return {
          x: point.x,
          y: 0
        };

      });
      lineData.push(d);
    });

    return lineData;
  }

  /**
   * Returns x point of line point
   * @param  {[type]} d [description]
   * @return {[type]}   [description]
   */
  acChartLogicProvider.getX = function (x, d) {
    return Math.round(x(d)) + x.rangeBand() / 2;
  }

  /**
   * Filters down the x axis labels if a limit is specified
   *
   * @access config
   */
  acChartLogicProvider.filterXAxis = function (config, xAxis, x){
    var allTicks = x.domain();
    if (config.xAxisMaxTicks && allTicks.length > config.xAxisMaxTicks) {
      var mod = Math.ceil(allTicks.length / config.xAxisMaxTicks);
      xAxis.tickValues(allTicks.filter(function(e, i) {
        return (i % mod) === 0;
      }));
    }
  };

  /**
   * Rotates xAxis labels by config option
   *
   * @access config
   * @param {[selection]}
   */
  acChartLogicProvider.rotateAxisLabels = function (config, box, y, xAxisSelection){
    if(config.xAxisLabelRotation == null || !config.xAxisLabelRotation)
      return;
    //Rotate text by config degrees
    xAxisSelection.selectAll('text')
      .style("text-anchor", "end")
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', function (d){return "rotate(" + config.xAxisLabelRotation + ")"})
    ;
    //Recalculate chart height
    box.height = (box.height + box.margin.bottom) - xAxisSelection.node().getBBox().height;
    //Set new bottom margin value
    box.margin.bottom = xAxisSelection.node().getBBox().height;
    //Move x axis to new bottom of chart
    xAxisSelection.attr("transform", "translate(0," + box.height + ")");
    //Redraw the yAxis scale to new height
    y.range([box.height, 10]);

    return this;
  }

  /**
   * Build and return graph object
   *
   * @return {Object}
   */
  acChartLogicProvider.getGraph = function (config, box, x, y){

    var graph = {};

    //Creates xAxis using scale var x
    graph.xAxis = d3.svg.axis().scale(x).orient("bottom");

    //Creates yAxis using scale var y
    graph.yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(5)
      .tickFormat(d3.format(config.yAxisTickFormat));

    //Limits xAxis label to config limit if set
    acChartLogicProvider.filterXAxis(config, graph.xAxis, x);

    //Draws the SVG element
    graph.svg = acChartLogicProvider.getSvg(box);

    //Draws the xAxis and saves the selection
    graph.xAxisSelection = graph.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + box.height + ")")
      .call(graph.xAxis);

    //Rotates labels and adjusts box height
    acChartLogicProvider.rotateAxisLabels(config, box, y, graph.xAxisSelection);

    //Draws the yAxis
    graph.yAxisSelection = graph.svg.append("g")
      .attr("class", "y axis")
      .call(graph.yAxis);
      
    return graph;
  };

  /**
   * Bar Chart Definition
   */
  acChartLogicProvider.addChart('bar', ['config', 'box', 'domFunctions', 'series', 'points', function (config, box, domFunctions, series, points){
    var acChartLogicProvider = this;

    acChartLogicProvider.applyMargins(box);

    // Sets all yData in a single array
    var yData = acChartLogicProvider.getYData(points, series);

    //Calculates maximum data series count
    var yMaxPoints = acChartLogicProvider.getYMaxPoints(points);

    //Creates the x Scale
    var x = d3.scale.ordinal()
      .domain(points.map(function (d) {
        //returns xAxis label
        return d.x;
      }))
      .rangeRoundBands([0, box.width], 0.1)
    ;

    //Adds padding to top of Y axis
    var padding = d3.max(yData) * 0.20;

    //Creates the y Scale
    var y = d3.scale.linear()
      .range([box.height, 10])
      .domain([d3.min(yData), d3.max(yData) + padding])
    ;

    // Creates the scale for series bars inside x Scale
    var x0 = d3.scale.ordinal()
      .domain(d3.range(yMaxPoints))
      .rangeRoundBands([0, x.rangeBand()])
    ;

    var graph = acChartLogicProvider.getGraph(config, box, x, y);

    //Add point data to x axis
    var barGroups = graph.svg.selectAll(".state")
      .data(points)
      .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) {
        return "translate(" + x(d.x) + ",0)";
      });

    //Draws series data
    var bars = barGroups.selectAll("rect")
      .data(function(d) {
        return d.nicedata;
      })
      .enter().append("rect")
      .attr("width", x0.rangeBand())//Sets bar width based on series scale (x0)
      .attr("x", function(d, i) { return x0(i); })//Sets x position based on series scale (x0)
      .style("fill", function(d) { return acChartLogicProvider.getColor(config, d.s); })//Sets bar color
    ;

    /**
     * Animate bar height from 0% to 100%
     */
    bars
      .attr("height", 0)
      .attr("y", box.height)
      .transition()
      .ease("cubic-in-out")
      .duration(config.isAnimate ? 1000 : 0)
      .attr("y", function(d) {
        return y(Math.max(0, d.y));
      })
      .attr("height", function(d) {
        return Math.abs(y(d.y) - y(0));
      });

    /**
     * Add events for tooltip
     */
    acChartLogicProvider.bindTooltipEvents(config, domFunctions, bars);

    /**
     * Create labels
     */
    if (config.labels) {
      barGroups.selectAll('not-a-class')
        .data(function(d) {
          return d.nicedata;
        })
        .enter().append("text")
        .attr("x", function(d, i) {
          return x0(i);
        })
        .attr("y", function(d) {
          return box.height - Math.abs(y(d.y) - y(0)) - 5;
        })
      .text(function(d) {
        return d.y;
      });
    }

    /**
     * Draw one zero line in case negative values exist
     */
    graph.svg.append("line")
      .attr("x1", box.width)
      .attr("y1", y(0))
      .attr("y2", y(0))
      .style("stroke", "silver");

  }]);
  
  /**
   * Line Chart Definition
   * Has Legend override
   */
  acChartLogicProvider.addChart('line', ['config', 'box', 'domFunctions', 'series', 'points', function (config, box, domFunctions, series, points) {
    var acChartLogicProvider = this;
    
    acChartLogicProvider.applyMargins(box);

    var yData = acChartLogicProvider.getYData(points, series);
    var yMaxPoints = acChartLogicProvider.getYMaxPoints(points);
    var linedata = acChartLogicProvider.getLineData(points, series);
    var padding = d3.max(yData) * 0.20;

    var x = d3.scale.ordinal()
      .domain(points.map(function(d) { return d.x; }))
      .rangeRoundBands([0, box.width])
    ;

    var y = d3.scale.linear()
      .range([box.height, 10])
      .domain([d3.min(yData), d3.max(yData) + padding])
    ;

    var graph = acChartLogicProvider.getGraph(config, box, x, y);

    var line = d3.svg.line()
      .interpolate(config.lineCurveType)
      .x(function(d) { return acChartLogicProvider.getX(x, d.x); })
      .y(function(d) { return y(d.y); })
    ;    

    var point = graph.svg.selectAll(".points")
      .data(linedata)
      .enter().append("g");

    var path = point.attr("points", "points")
      .append("path")
      .attr("class", "ac-line")
      .style("stroke", function(d, i) {
        return acChartLogicProvider.getColor(config, i);
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
    if (linedata.length > 0) {
      var last = linedata[linedata.length - 1].values;
      if (last.length > 0) {
        path.each(function (d){ d.totalLength = this.getTotalLength(); }) // http://stackoverflow.com/a/21140763/2661741
          .attr("stroke-dasharray", function (d){ return d.totalLength + " " + d.totalLength; })
          .attr("stroke-dashoffset", function (d){ return d.totalLength; })
          .transition()
          .duration(config.isAnimate ? 1500 : 0)
          .ease("linear")
          .attr("stroke-dashoffset", 0)
          .attr("d", function(d) {
            return line(d.values);
          });
      }
    }

    /**
     * Add points
     * @param  {[type]} value [description]
     * @param  {[type]} key   [description]
     * @return {[type]}       [description]
     */
    angular.forEach(linedata, function(value, key) {
      var points = graph.svg.selectAll('.circle')
        .data(value.values)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
          return acChartLogicProvider.getX(x, d.x);
        })
        .attr("cy", function(d) {
          return y(d.y);
        })
        .attr("r", 3)
        .style("fill", acChartLogicProvider.getColor(config, linedata.indexOf(value)))
        .style("stroke", acChartLogicProvider.getColor(config, linedata.indexOf(value)))
      ;

        acChartLogicProvider.bindTooltipEvents(config, domFunctions, points);

      if (config.labels) {
        points.append("text")
          .attr("x", function(d) {
            return acChartLogicProvider.getX(x, d.x);
          })
          .attr("y", function(d) {
            return y(d.y);
          })
          .text(function(d) {
            return d.y;
          })
        ;
      }
    });


    /**
     * Labels at the end of line
     */
    if (config.lineLegend === 'lineEnd') {
      point.append("text")
        .datum(function(d) {
          return {
            name: d.series,
            value: d.values[d.values.length - 1]
          };
        })
        .attr("transform", function(d) {
          return "translate(" + acChartLogicProvider.getX(x, d.value.x) + "," + y(d.value.y) + ")";
        })
        .attr("x", 3)
        .text(function(d) {
          return d.name;
        });
    }
    return linedata;
  }], ['config', 'box', 'series', 'points', function (config, box, series, points){
    if(config.lineLegend == "traditional"){
      this.defaultLegend(config, box, series, points);
    }
  }]);

  /**
   * Area Chart Definition
   */
  acChartLogicProvider.addChart('area', ['config', 'box', 'domFunctions', 'series', 'points', function (config, box, domFunctions, series, points){
    var acChartLogicProvider = this;
    
    acChartLogicProvider.applyMargins(box);

    var yData = acChartLogicProvider.getYData(points, series);
    var yMaxPoints = acChartLogicProvider.getYMaxPoints(points);
    var linedata = acChartLogicProvider.getLineData(points, series);
    var padding = d3.max(yData) * 0.20;

    var x = d3.scale.ordinal()
      .domain(points.map(function(d) {
        return d.x;
      }))
      .rangePoints([0, box.width])
    ;

    var y = d3.scale.linear()
      .range([box.height, 10])
      .domain([d3.min(yData), d3.max(yData) + padding])
    ;

    var graph = acChartLogicProvider.getGraph(config, box, x, y);

    d3.svg.line()
      .interpolate(config.lineCurveType)
      .x(function(d) { return acChartLogicProvider.getX(x, d.x); })
      .y(function(d) { return y(d.y); })
    ;

    var point = graph.svg.selectAll(".points")
      .data(linedata)
      .enter().append("g");

    var area = d3.svg.area()
      .interpolate('basis')
      .x(function(d) {
        return acChartLogicProvider.getX(x, d.x);
      })
      .y0(function() {
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
        return acChartLogicProvider.getColor(config, i);
      })
      .style("opacity", "0.7");
  }]);
  
  /**
   * Point Chart Definition
   */
  acChartLogicProvider.addChart('point', ['config', 'box', 'domFunctions', 'series', 'points', function (config, box, domFunctions, series, points){
    var acChartLogicProvider = this;
    
    acChartLogicProvider.applyMargins(box);

    var yData = acChartLogicProvider.getYData(points, series);
    var yMaxPoints = acChartLogicProvider.getYMaxPoints(points);
    var linedata = acChartLogicProvider.getLineData(points, series);
    var padding = d3.max(yData) * 0.20;

    var x = d3.scale.ordinal()
      .domain(points.map(function(d) {
        return d.x;
      }))
      .rangeRoundBands([0, box.width])
    ;

    var y = d3.scale.linear()
      .range([box.height, 10])
      .domain([d3.min(yData), d3.max(yData) + padding])
    ;

    var graph = acChartLogicProvider.getGraph(config, box, x, y);

    graph.svg.selectAll(".points")
      .data(linedata)
      .enter().append("g");

    /**
     * Add points
     * @param  {[type]} value [description]
     * @param  {[type]} key   [description]
     * @return {[type]}       [description]
     */
    angular.forEach(linedata, function(value, key) {
      var points = graph.svg.selectAll('.circle')
        .data(value.values)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
          return acChartLogicProvider.getX(x, d.x);
        })
        .attr("cy", function(d) {
          return y(d.y);
        })
        .attr("r", 3)
        .style("fill", acChartLogicProvider.getColor(config, linedata.indexOf(value)))
        .style("stroke", acChartLogicProvider.getColor(config, linedata.indexOf(value)))
      ;

      acChartLogicProvider.bindTooltipEvents(config, domFunctions, points);

      if (config.labels) {
        points.append("text")
          .attr("x", function(d) {
            return acChartLogicProvider.getX(x, d.x);
          })
          .attr("y", function(d) {
            return y(d.y);
          })
          .text(function(d) {
            return d.y;
          })
        ;
      }
    });
  }]);

  /**
   * Pie Chart Definition
   * Has Legend override
   */
  acChartLogicProvider.addChart('pie', ['config', 'box', 'domFunctions', 'series', 'points', function (config, box, domFunctions, series, points){
    var acChartLogicProvider = this;

    var radius = Math.min(box.width, box.height) / 2;

    var svg = acChartLogicProvider.getSvg(box)
      .attr("transform", "translate(" + box.width / 2 + "," + box.height / 2 + ")") //Override margin translate in getSvg()
    ;

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
      .data(pie(points).filter(function (d){
        return d.value > 0;
      }).map(function(d){
        // pie() puts existing data into data property, events need this
        d.x = d.data.x;
        d.y = d.data.y[0];
        d.tooltip = d.data.tooltip;
        return d;
      }))
      .enter().append("g");

    var complete = false;

    path.append("path")
      .style("fill", function(d, i) {
        return acChartLogicProvider.getColor(config, i);
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
          acChartLogicProvider.bindTooltipEvents(config, domFunctions, path);
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
  }], ['config', 'box', 'series', 'points', function (config, box, series, points){
      var acChartLogicProvider = this;

      var filteredPoints = points.filter(function (d){return d.y[0] > 0;});

      angular.forEach(filteredPoints, function(value, key) {
        box.legends.push({
          color: config.colors[key],
          title: acChartLogicProvider.getBindableTextForLegend(config, value.x)
        });
      });

      box.yMaxData = filteredPoints.length;
  }]);
  
  
  return acChartLogicProvider;

 });