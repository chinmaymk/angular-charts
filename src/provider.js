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
   * @return {Object} this
   */
  acChartLogicProvider.addChart = function (type, chartFunction, legendFunction){
    if(!isInvokable(chartFunction)){
        throw new Error('addChart expects parameter 2 to be function');
    }

    if(legendFunction != null && !isInvokable(legendFunction)){
        console.log(legendFunction)
        throw new Error('addChart expects parameter 3 if set to be function');
      }
    
    chartFunctions[type] = {
      chart: chartFunction,
      legend: (legendFunction != null)? legendFunction : acChartLogicProvider.defaultLegend
    };

    return acChartLogicProvider;
  };

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
  acChartLogicProvider.rotateAxisLabels = function (config, selection){
    selection
      .style("text-anchor", "end")
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', function (d){return "rotate(" + config.xAxisLabelRotation + ")"});
  }

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
   * Note: Must be injectable
   *
   * @access config
   */
  acChartLogicProvider.defaultLegend = ['config', 'box', 'series', 'points', function (config, box, series, points){
    var acChartLogicProvider = this;

    angular.forEach(series, function(value, key) {
      box.legends.push({
        color: config.colors[key],
        title: acChartLogicProvider.getBindableTextForLegend(config, value)
      });
    });
  }];


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
   * Bar Chart Definition
   */
  acChartLogicProvider.addChart('bar', ['config', 'box', 'domFunctions', 'series', 'points', function (config, box, domFunctions, series, points){
    var acChartLogicProvider = this;
    /**
     * Setup date attributes
     * @type {Object}
     */
    box.margin = {
      top: 0,
      right: 20,
      bottom: 30,
      left: 40
    };
    box.width -= box.margin.left + box.margin.right;
    box.height -= box.margin.top + box.margin.bottom;

    var x = d3.scale.ordinal()
      .rangeRoundBands([0, box.width], 0.1);

    var y = d3.scale.linear()
      .range([box.height, 10]);

    var x0 = d3.scale.ordinal()
      .rangeRoundBands([0, box.width], 0.1);

    var yData = [0];

    points.forEach(function(d) {
      d.nicedata = d.y.map(function(e, i) {
        yData.push(e);
        return {
          x: d.x,
          y: e,
          s: i,
          tooltip: angular.isArray(d.tooltip) ? d.tooltip[i] : d.tooltip
        };
      });
    });

    var yMaxPoints = d3.max(points.map(function(d) {
      return d.y.length;
    }));

    x.domain(points.map(function(d) {
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
    acChartLogicProvider.filterXAxis(config, xAxis, x);

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10)
      .tickFormat(d3.format(config.yAxisTickFormat));

    /**
     * Start drawing the chart!
     * @type {[type]}
     */
    var svg = d3.select(box.chartContainer[0]).append("svg")
      .attr("width", box.width + box.margin.left + box.margin.right)
      .attr("height", box.height + box.margin.top + box.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + box.margin.left + "," + box.margin.top + ")");

    var xAxisSelection = svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + box.height + ")")
      .call(xAxis);

    if(config.xAxisLabelRotation){
      acChartLogicProvider.rotateAxisLabels(config, xAxisSelection.selectAll("text")); //Call before getting measurements
      box.height = (box.height + box.margin.bottom) - xAxisSelection.node().getBBox().height;
      box.margin.bottom = xAxisSelection.node().getBBox().height;
      xAxisSelection.attr("transform", "translate(0," + box.height + ")");
      y.range([box.height, 10]);
    }

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
      .attr("y", box.height)
      .style("fill", function(d) {
        return acChartLogicProvider.getColor(config, d.s);
      })
      .attr("height", 0)
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
     * @param  {[type]} d [description]
     * @return {[type]}   [description]
     */
    bars.on("mouseover", function(d) {

      domFunctions.makeToolTip({
        index: d.x,
        value: d.tooltip ? d.tooltip : d.y,
        series: series[d.s]
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
          return box.height - Math.abs(y(d.y) - y(0));
        })
      // .attr("transform", "rotate(270)")
      .text(function(d) {
        return d.y;
      });
    }

    /**
     * Draw one zero line in case negative values exist
     */
    svg.append("line")
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
    box.margin = {
      top: 0,
      right: 40,
      bottom: 20,
      left: 40
    };
    box.width -= box.margin.left + box.margin.right;
    box.height -= box.margin.top + box.margin.bottom;

    var x = d3.scale.ordinal()
      .domain(points.map(function(d) {
        return d.x;
      }))
      .rangeRoundBands([0, box.width]);

    var y = d3.scale.linear()
      .range([box.height, 10]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");
    acChartLogicProvider.filterXAxis(config, xAxis, x);

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(5)
      .tickFormat(d3.format(config.yAxisTickFormat));

    var line = d3.svg.line()
      .interpolate(config.lineCurveType)
      .x(function(d) {
        return getX(d.x);
      })
      .y(function(d) {
        return y(d.y);
      });

    var yData = [0];
    var linedata = [];

    points.forEach(function(d) {
      d.y.map(function(e) {
        yData.push(e);
      });
    });

    var yMaxPoints = d3.max(points.map(function(d) {
      return d.y.length;
    }));

    series.slice(0, yMaxPoints).forEach(function(value, index) {
      var d = {};
      d.series = value;
      d.values = points.map(function(point) {
        return point.y.map(function(e) {
          return {
            x: point.x,
            y: e,
            tooltip: point.tooltip
          };
        })[index] || {
          x: points[index].x,
          y: 0
        };
      });
      linedata.push(d);
    });

    var svg = d3.select(box.chartContainer[0]).append("svg")
      .attr("width", box.width + box.margin.left + box.margin.right)
      .attr("height", box.height + box.margin.top + box.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + box.margin.left + "," + box.margin.top + ")");

    var padding = d3.max(yData) * 0.20;

    y.domain([d3.min(yData), d3.max(yData) + padding]);

    var xAxisSelection = svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + box.height + ")")
      .call(xAxis);

    if(config.xAxisLabelRotation){
      acChartLogicProvider.rotateAxisLabels(config, xAxisSelection.selectAll("text")); //Call before getting measurements
      box.height = (box.height + box.margin.bottom) - xAxisSelection.node().getBBox().height;
      box.margin.bottom = xAxisSelection.node().getBBox().height;
      xAxisSelection.attr("transform", "translate(0," + box.height + ")");
      y.range([box.height, 10]);
    }

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    var point = svg.selectAll(".points")
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
      var points = svg.selectAll('.circle')
        .data(value.values)
        .enter();

      points.append("circle")
        .attr("cx", function(d) {
          return getX(d.x);
        })
        .attr("cy", function(d) {
          return y(d.y);
        })
        .attr("r", 3)
        .style("fill", acChartLogicProvider.getColor(config, linedata.indexOf(value)))
        .style("stroke", acChartLogicProvider.getColor(config, linedata.indexOf(value)))
        .on("mouseover", (function(series) {
          return function(d) {

            domFunctions.makeToolTip({
              index: d.x,
              value: d.tooltip ? d.tooltip : d.y,
              series: series
            }, d, d3.event);

          };
        })(value.series))
        .on("mouseleave", function(d) {
          domFunctions.removeToolTip(d, d3.event);
        })
        .on("mousemove", function(d) {
          domFunctions.updateToolTip(d, d3.event);
        })
        .on("click", function(d) {
          domFunctions.click(d, d3.event);
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
          return "translate(" + getX(d.value.x) + "," + y(d.value.y) + ")";
        })
        .attr("x", 3)
        .text(function(d) {
          return d.name;
        });
    }

    /**
     * Returns x point of line point
     * @param  {[type]} d [description]
     * @return {[type]}   [description]
     */
    function getX(d) {
      return Math.round(x(d)) + x.rangeBand() / 2;
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
    box.margin = {
      top: 0,
      right: 40,
      bottom: 20,
      left: 40
    };
    box.width -= box.margin.left + box.margin.right;
    box.height -= box.margin.top + box.margin.bottom;

    var x = d3.scale.ordinal()
      .domain(points.map(function(d) {
        return d.x;
      }))
      .rangePoints([0, box.width]);

    var y = d3.scale.linear()
      .range([box.height, 10]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");
    acChartLogicProvider.filterXAxis(config, xAxis, x);

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(5)
      .tickFormat(d3.format(config.yAxisTickFormat));

    d3.svg.line()
      .interpolate(config.lineCurveType)
      .x(function(d) {
        return getX(d.x);
      })
      .y(function(d) {
        return y(d.y);
      });

    var yData = [0];
    var linedata = [];

    points.forEach(function(d) {
      d.y.map(function(e) {
        yData.push(e);
      });
    });

    var yMaxPoints = d3.max(points.map(function(d) {
      return d.y.length;
    }));

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

    var svg = d3.select(box.chartContainer[0]).append("svg")
      .attr("width", box.width + box.margin.left + box.margin.right)
      .attr("height", box.height + box.margin.top + box.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + box.margin.left + "," + box.margin.top + ")");

    var padding = d3.max(yData) * 0.20;

    y.domain([d3.min(yData), d3.max(yData) + padding]);

    var xAxisSelection = svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + box.height + ")")
      .call(xAxis);

    if(config.xAxisLabelRotation){
      acChartLogicProvider.rotateAxisLabels(config, xAxisSelection.selectAll("text")); //Call before getting measurements
      box.height = (box.height + box.margin.bottom) - xAxisSelection.node().getBBox().height;
      box.margin.bottom = xAxisSelection.node().getBBox().height;
      xAxisSelection.attr("transform", "translate(0," + box.height + ")");
      y.range([box.height, 10]);
    }

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

    function getX(d) {
      return Math.round(x(d)) + x.rangeBand() / 2;
    }
  }]);
  
  /**
   * Point Chart Definition
   */
  acChartLogicProvider.addChart('point', ['config', 'box', 'domFunctions', 'series', 'points', function (config, box, domFunctions, series, points){
    var acChartLogicProvider = this;
    box.margin = {
      top: 0,
      right: 40,
      bottom: 20,
      left: 40
    };
    box.width -= box.margin.left - box.margin.right;
    box.height -= box.margin.top - box.margin.bottom;

    var x = d3.scale.ordinal()
      .domain(points.map(function(d) {
        return d.x;
      }))
      .rangeRoundBands([0, box.width]);

    var y = d3.scale.linear()
      .range([box.height, 10]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");
    acChartLogicProvider.filterXAxis(config, xAxis, x);

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(5)
      .tickFormat(d3.format(config.yAxisTickFormat));

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

    var svg = d3.select(box.chartContainer[0]).append("svg")
      .attr("width", box.width + box.margin.left + box.margin.right)
      .attr("height", box.height + box.margin.top + box.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + box.margin.left + "," + box.margin.top + ")");

    var padding = d3.max(yData) * 0.20;

    y.domain([d3.min(yData), d3.max(yData) + padding]);

    var xAxisSelection = svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + box.height + ")")
      .call(xAxis);

    if(config.xAxisLabelRotation){
      acChartLogicProvider.rotateAxisLabels(config, xAxisSelection.selectAll("text")); //Call before getting measurements
      box.height = (box.height + box.margin.bottom) - xAxisSelection.node().getBBox().height;
      box.margin.bottom = xAxisSelection.node().getBBox().height;
      xAxisSelection.attr("transform", "translate(0," + box.height + ")");
      y.range([box.height, 10]);
    }

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
          return getX(d.x);
        })
        .attr("cy", function(d) {
          return y(d.y);
        })
        .attr("r", 3)
        .style("fill", acChartLogicProvider.getColor(config, linedata.indexOf(value)))
        .style("stroke", acChartLogicProvider.getColor(config, linedata.indexOf(value)))
        .on("mouseover", (function(series) {
          return function(d) {

            domFunctions.makeToolTip({
              index: d.x,
              value: d.tooltip ? d.tooltip : d.y,
              series: series
            }, d, d3.event);

          };
        })(value.series))
        .on("mouseleave", function(d) {
          domFunctions.removeToolTip(d, d3.event);
        })
        .on("mousemove", function(d) {
          domFunctions.updateToolTip(d, d3.event);
        })
        .on("click", function(d) {
          domFunctions.click(d, d3.event);
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
  }]);

  /**
   * Pie Chart Definition
   * Has Legend override
   */
  acChartLogicProvider.addChart('pie', ['config', 'box', 'domFunctions', 'series', 'points', function (config, box, domFunctions, series, points){
    var acChartLogicProvider = this;

    var radius = Math.min(box.width, box.height) / 2;
    var svg = d3.select(box.chartContainer[0]).append("svg")
      .attr("width", box.width)
      .attr("height", box.height)
      .append("g")
      .attr("transform", "translate(" + box.width / 2 + "," + box.height / 2 + ")");
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

          //Add listeners when transition is done
          path.on("mouseover", function(d) {

            domFunctions.makeToolTip({
              value: d.data.tooltip ? d.data.tooltip : d.data.y[0]
            }, d, d3.event);

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

              domFunctions.removeToolTip(d, d3.event);
            })
            .on("mousemove", function(d) {
              domFunctions.updateToolTip(d, d3.event);
            })
            .on("click", function(d) {
              domFunctions.click(d, d3.event);
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