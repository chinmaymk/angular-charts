angular.module('angularCharts', ['angularChartsTemplates']);
angular.module('angularCharts').directive('acChart', [
  '$templateCache',
  '$compile',
  '$window',
  function ($templateCache, $compile, $window) {
    var tooltip = [
        'display:none;',
        'position:absolute;',
        'border:1px solid #333;',
        'background-color:#161616;',
        'border-radius:5px;',
        'padding:5px;',
        'color:#fff;'
      ].join('');
    function getRandomColor() {
      var letters = '0123456789ABCDEF'.split('');
      var color = '#';
      for (var i = 0; i < 6; i++) {
        color += letters[Math.round(Math.random() * 15)];
      }
      return color;
    }
    function link(scope, element, attrs) {
      var config = {
          title: '',
          tooltips: true,
          tooltipGenerator: null,
          labels: false,
          mouseover: function () {
          },
          mouseout: function () {
          },
          click: function () {
          },
          legend: {
            display: true,
            position: 'left'
          },
          colors: [
            'steelBlue',
            'rgb(255,153,0)',
            'rgb(220,57,18)',
            'rgb(70,132,238)',
            'rgb(73,66,204)',
            'rgb(0,128,0)'
          ]
        };
      var totalWidth = element.width(), totalHeight = element.height();
      var data, series, points, height, width, chartContainer, legendContainer, chartType, isAnimate = true, defaultColors = config.colors;
      function init() {
        prepareData();
        setHeightWidth();
        setContainers();
        var chartFunc = getChartFunction(chartType);
        chartFunc();
        drawLegend();
      }
      function setHeightWidth() {
        if (!config.legend.display) {
          height = totalHeight;
          width = totalWidth;
          return;
        }
        switch (config.legend.position) {
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
      function setContainers() {
        var container = $templateCache.get(config.legend.position);
        element.html($compile(container)(scope));
        chartContainer = element.find('.ac-chart');
        legendContainer = element.find('.ac-legend');
        height -= element.find('.ac-title').height();
      }
      function prepareData() {
        data = scope.acData;
        chartType = scope.acChart;
        series = data.series;
        points = data.data;
        if (scope.acConfig) {
          angular.extend(config, scope.acConfig);
          config.colors = config.colors.concat(defaultColors);
        }
      }
      function getChartFunction(type) {
        var charts = {
            'pie': pieChart,
            'bar': barChart,
            'line': lineChart,
            'area': areaChart,
            'point': pointChart
          };
        return charts[type];
      }
      function barChart() {
        var margin = {
            top: 0,
            right: 20,
            bottom: 30,
            left: 40
          };
        width -= margin.left + margin.right;
        height -= margin.top + margin.bottom;
        var x = d3.scale.ordinal().rangeRoundBands([
            0,
            width
          ], 0.1);
        var y = d3.scale.linear().range([
            height,
            10
          ]);
        var x0 = d3.scale.ordinal().rangeRoundBands([
            0,
            width
          ], 0.1);
        var yData = [0];
        points.forEach(function (d) {
          d.nicedata = d.y.map(function (e, i) {
            yData.push(e);
            return {
              x: d.x,
              y: e,
              s: i
            };
          });
        });
        var yMaxPoints = d3.max(points.map(function (d) {
            return d.y.length;
          }));
        scope.yMaxData = yMaxPoints;
        x.domain(points.map(function (d) {
          return d.x;
        }));
        var padding = d3.max(yData) * 0.2;
        y.domain([
          d3.min(yData),
          d3.max(yData) + padding
        ]);
        x0.domain(d3.range(yMaxPoints)).rangeRoundBands([
          0,
          x.rangeBand()
        ]);
        var xAxis = d3.svg.axis().scale(x).orient('bottom');
        var yAxis = d3.svg.axis().scale(y).orient('left').ticks(10).tickFormat(d3.format('s'));
        var svg = d3.select(chartContainer[0]).append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        svg.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);
        svg.append('g').attr('class', 'y axis').call(yAxis);
        var barGroups = svg.selectAll('.state').data(points).enter().append('g').attr('class', 'g').attr('transform', function (d) {
            return 'translate(' + x(d.x) + ',0)';
          });
        var bars = barGroups.selectAll('rect').data(function (d) {
            return d.nicedata;
          }).enter().append('rect');
        bars.attr('width', x0.rangeBand());
        bars.attr('x', function (d, i) {
          return x0(i);
        }).attr('y', height).style('fill', function (d) {
          return getColor(d.s);
        }).attr('height', 0).transition().ease('cubic-in-out').duration(1000).attr('y', function (d) {
          return y(Math.max(0, d.y));
        }).attr('height', function (d) {
          return Math.abs(y(d.y) - y(0));
        });
        bars.on('mouseover', function (d) {
          makeToolTip({
            value: d.y,
            series: series[d.s],
            index: d.x
          }, d3.event);
          config.mouseover(d, d3.event);
          scope.$apply();
        }).on('mouseleave', function (d) {
          removeToolTip();
          config.mouseout(d, d3.event);
          scope.$apply();
        }).on('mousemove', function (d) {
          updateToolTip(d3.event);
        }).on('click', function (d) {
          config.click.call(d, d3.event);
          scope.$apply();
        });
        if (config.labels) {
          barGroups.selectAll('not-a-class').data(function (d) {
            return d.nicedata;
          }).enter().append('text').attr('x', function (d, i) {
            return x0(i);
          }).attr('y', function (d) {
            return height - Math.abs(y(d.y) - y(0));
          }).text(function (d) {
            return d.y;
          });
        }
        svg.append('line').attr('x1', width).attr('y1', y(0)).attr('y2', y(0)).style('stroke', 'silver');
      }
      function lineChart() {
        var margin = {
            top: 0,
            right: 40,
            bottom: 20,
            left: 40
          };
        width -= margin.left + margin.right;
        height -= margin.top + margin.bottom;
        var x = d3.scale.ordinal().domain(points.map(function (d) {
            return d.x;
          })).rangeRoundBands([
            0,
            width
          ]);
        var y = d3.scale.linear().range([
            height,
            10
          ]);
        var xAxis = d3.svg.axis().scale(x).orient('bottom');
        var yAxis = d3.svg.axis().scale(y).orient('left').ticks(5).tickFormat(d3.format('s'));
        var line = d3.svg.line().interpolate('cardinal').x(function (d) {
            return getX(d.x);
          }).y(function (d) {
            return y(d.y);
          });
        var yData = [0];
        var linedata = [];
        points.forEach(function (d) {
          d.y.map(function (e, i) {
            yData.push(e);
          });
        });
        var yMaxPoints = d3.max(points.map(function (d) {
            return d.y.length;
          }));
        series.slice(0, yMaxPoints).forEach(function (value, index) {
          var d = {};
          d.series = value;
          d.values = points.map(function (point) {
            return point.y.map(function (e) {
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
        var svg = d3.select(chartContainer[0]).append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        var padding = d3.max(yData) * 0.2;
        y.domain([
          d3.min(yData),
          d3.max(yData) + padding
        ]);
        svg.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);
        svg.append('g').attr('class', 'y axis').call(yAxis);
        var point = svg.selectAll('.points').data(linedata).enter().append('g');
        path = point.attr('points', 'points').append('path').attr('class', 'ac-line').style('stroke', function (d, i) {
          return getColor(i);
        }).attr('d', function (d) {
          return line(d.values);
        }).attr('stroke-width', '2').attr('fill', 'none');
        var last = linedata[linedata.length - 1].values;
        var totalLength = path.node().getTotalLength() + getX(last[last.length - 1].x);
        path.attr('stroke-dasharray', totalLength + ' ' + totalLength).attr('stroke-dashoffset', totalLength).transition().duration(1500).ease('linear').attr('stroke-dashoffset', 0).attr('d', function (d) {
          return line(d.values);
        });
        angular.forEach(linedata, function (value, key) {
          var points = svg.selectAll('.circle').data(value.values).enter();
          points.append('circle').attr('cx', function (d) {
            return getX(d.x);
          }).attr('cy', function (d) {
            return y(d.y);
          }).attr('r', 3).style('fill', getColor(linedata.indexOf(value))).style('stroke', getColor(linedata.indexOf(value))).on('mouseover', function (series) {
            return function (d) {
              makeToolTip({
                index: d.x,
                value: d.y,
                series: series
              }, d3.event);
              config.mouseover(d, d3.event);
              scope.$apply();
            };
          }(value.series)).on('mouseleave', function (d) {
            removeToolTip();
            config.mouseout(d, d3.event);
            scope.$apply();
          }).on('mousemove', function (d) {
            updateToolTip(d3.event);
          }).on('click', function (d) {
            config.click(d, d3.event);
            scope.$apply();
          });
          if (config.labels) {
            points.append('text').attr('x', function (d) {
              return getX(d.x);
            }).attr('y', function (d) {
              return y(d.y);
            }).text(function (d) {
              return d.y;
            });
          }
        });
        point.append('text').datum(function (d) {
          return {
            name: d.series,
            value: d.values[d.values.length - 1]
          };
        }).attr('transform', function (d) {
          return 'translate(' + getX(d.value.x) + ',' + y(d.value.y) + ')';
        }).attr('x', 3).text(function (d) {
          return d.name;
        });
        function getX(d) {
          return Math.round(x(d)) + x.rangeBand() / 2;
        }
        ;
        return linedata;
      }
      function areaChart() {
        var margin = {
            top: 0,
            right: 40,
            bottom: 20,
            left: 40
          };
        width -= margin.left + margin.right;
        height -= margin.top + margin.bottom;
        var x = d3.scale.ordinal().domain(points.map(function (d) {
            return d.x;
          })).rangeRoundBands([
            0,
            width
          ]);
        var y = d3.scale.linear().range([
            height,
            10
          ]);
        var xAxis = d3.svg.axis().scale(x).orient('bottom');
        var yAxis = d3.svg.axis().scale(y).orient('left').ticks(5).tickFormat(d3.format('s'));
        var line = d3.svg.line().interpolate('cardinal').x(function (d) {
            return getX(d.x);
          }).y(function (d) {
            return y(d.y);
          });
        var yData = [0];
        var linedata = [];
        points.forEach(function (d) {
          d.y.map(function (e, i) {
            yData.push(e);
          });
        });
        var yMaxPoints = d3.max(points.map(function (d) {
            return d.y.length;
          }));
        scope.yMaxData = yMaxPoints;
        series.slice(0, yMaxPoints).forEach(function (value, index) {
          var d = {};
          d.series = value;
          d.values = points.map(function (point) {
            return point.y.map(function (e) {
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
        var svg = d3.select(chartContainer[0]).append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        var padding = d3.max(yData) * 0.2;
        y.domain([
          d3.min(yData),
          d3.max(yData) + padding
        ]);
        svg.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);
        svg.append('g').attr('class', 'y axis').call(yAxis);
        var point = svg.selectAll('.points').data(linedata).enter().append('g');
        var area = d3.svg.area().interpolate('basis').x(function (d) {
            return getX(d.x);
          }).y0(function (d) {
            return y(0);
          }).y1(function (d) {
            return y(0 + d.y);
          });
        point.append('path').attr('class', 'area').attr('d', function (d) {
          return area(d.values);
        }).style('fill', function (d, i) {
          return getColor(i);
        }).style('opacity', '0.7');
        function getX(d) {
          return Math.round(x(d)) + x.rangeBand() / 2;
        }
        ;
      }
      function pieChart() {
        var radius = Math.min(width, height) / 2;
        var svg = d3.select(chartContainer[0]).append('svg').attr('width', width).attr('height', height).append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
        scope.yMaxData = points.length;
        var arc = d3.svg.arc().outerRadius(radius - 10).innerRadius(0);
        var arcOver = d3.svg.arc().outerRadius(radius + 5).innerRadius(0);
        var pie = d3.layout.pie().sort(null).value(function (d) {
            return d.y[0];
          });
        var path = svg.selectAll('.arc').data(pie(points)).enter().append('g');
        var arcs = path.append('path').style('fill', function (d, i) {
            return getColor(i);
          }).transition().ease('linear').duration(500).attrTween('d', tweenPie).attr('class', 'arc');
        path.on('mouseover', function (d) {
          makeToolTip({ value: d.data.y[0] }, d3.event);
          d3.select(this).select('path').transition().duration(200).style('stroke', 'white').style('stroke-width', '2px');
          config.mouseover(d, d3.event);
          scope.$apply();
        }).on('mouseleave', function (d) {
          d3.select(this).select('path').transition().duration(200).style('stroke', '').style('stroke-width', '');
          removeToolTip();
          config.mouseout(d, d3.event);
          scope.$apply();
        }).on('mousemove', function (d) {
          updateToolTip(d3.event);
        }).on('click', function (d) {
          config.click(d, d3.event);
          scope.$apply();
        });
        if (!!config.labels) {
          path.append('text').attr('transform', function (d) {
            return 'translate(' + arc.centroid(d) + ')';
          }).attr('dy', '.35em').style('text-anchor', 'middle').text(function (d) {
            return d.data.y[0];
          });
        }
        function tweenPie(b) {
          b.innerRadius = 0;
          var i = d3.interpolate({
              startAngle: 0,
              endAngle: 0
            }, b);
          return function (t) {
            return arc(i(t));
          };
        }
      }
      function pointChart() {
        var margin = {
            top: 0,
            right: 40,
            bottom: 20,
            left: 40
          };
        width -= margin.left - margin.right;
        height -= margin.top - margin.bottom;
        var x = d3.scale.ordinal().domain(points.map(function (d) {
            return d.x;
          })).rangeRoundBands([
            0,
            width
          ]);
        var y = d3.scale.linear().range([
            height,
            10
          ]);
        var xAxis = d3.svg.axis().scale(x).orient('bottom');
        var yAxis = d3.svg.axis().scale(y).orient('left').ticks(5).tickFormat(d3.format('s'));
        var yData = [0];
        var linedata = [];
        points.forEach(function (d) {
          d.y.map(function (e, i) {
            yData.push(e);
          });
        });
        var yMaxPoints = d3.max(points.map(function (d) {
            return d.y.length;
          }));
        scope.yMaxPoints = yMaxPoints;
        series.slice(0, yMaxPoints).forEach(function (value, index) {
          var d = {};
          d.series = value;
          d.values = points.map(function (point) {
            return point.y.map(function (e) {
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
        var svg = d3.select(chartContainer[0]).append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        var padding = d3.max(yData) * 0.2;
        y.domain([
          d3.min(yData),
          d3.max(yData) + padding
        ]);
        svg.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);
        svg.append('g').attr('class', 'y axis').call(yAxis);
        var point = svg.selectAll('.points').data(linedata).enter().append('g');
        angular.forEach(linedata, function (value, key) {
          var points = svg.selectAll('.circle').data(value.values).enter();
          points.append('circle').attr('cx', function (d) {
            return getX(d.x);
          }).attr('cy', function (d) {
            return y(d.y);
          }).attr('r', 3).style('fill', getColor(linedata.indexOf(value))).style('stroke', getColor(linedata.indexOf(value))).on('mouseover', function (series) {
            return function (d) {
              makeToolTip({
                index: d.x,
                value: d.y,
                series: series
              }, d3.event);
              config.mouseover(d, d3.event);
              scope.$apply();
            };
          }(value.series)).on('mouseleave', function (d) {
            removeToolTip();
            config.mouseout(d, d3.event);
            scope.$apply();
          }).on('mousemove', function (d) {
            updateToolTip(d3.event);
          }).on('click', function (d) {
            config.click(d, d3.event);
            scope.$apply();
          });
          if (config.labels) {
            points.append('text').attr('x', function (d) {
              return getX(d.x);
            }).attr('y', function (d) {
              return y(d.y);
            }).text(function (d) {
              return d.y;
            });
          }
        });
        function getX(d) {
          return Math.round(x(d)) + x.rangeBand() / 2;
        }
        ;
      }
      function makeToolTip(data, event) {
        if (!config.tooltips) {
          return;
        }
        data = config.tooltipGenerator ? config.tooltipGenerator(data) : data.value;
        angular.element('<p class="ac-tooltip" style="' + tooltip + '"></p>').html(data).appendTo('body').fadeIn('slow').css({
          left: event.pageX + 20,
          top: event.pageY - 30
        });
      }
      function removeToolTip() {
        angular.element('.ac-tooltip').remove();
      }
      function updateToolTip(event) {
        angular.element('.ac-tooltip').css({
          left: event.pageX + 20,
          top: event.pageY - 30
        });
      }
      function drawLegend() {
        scope.legends = [];
        if (chartType == 'pie') {
          angular.forEach(points, function (value, key) {
            scope.legends.push({
              color: config.colors[key],
              title: value.x
            });
          });
        }
        if (chartType == 'bar' || chartType == 'area' || chartType == 'point') {
          angular.forEach(series, function (value, key) {
            scope.legends.push({
              color: config.colors[key],
              title: value
            });
          });
        }
      }
      function getColor(i) {
        if (i < config.colors.length) {
          return config.colors[i];
        } else {
          var color = getRandomColor();
          config.colors.push(color);
          return color;
        }
      }
      var w = angular.element($window);
      scope.getWindowDimensions = function () {
        return {
          'h': w.height(),
          'w': w.width()
        };
      };
      scope.$watch('acChart', function () {
        init();
      }, true);
      scope.$watch('acData', function () {
        init();
      }, true);
      scope.$watch('acConfig', function () {
        init();
      }, true);
    }
    return {
      restrict: 'EA',
      link: link,
      transclude: 'true',
      scope: {
        acChart: '=',
        acData: '=',
        acConfig: '='
      }
    };
  }
]);
angular.module('angularChartsTemplates', ['left', 'right']);

angular.module("left", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("left",
    "\n" +
    "<style>\n" +
    "	.axis path,\n" +
    "	.axis line {\n" +
    "	  fill: none;\n" +
    "	  stroke: #333;\n" +
    "	}\n" +
    "	.ac-line {\n" +
    "		fill:none;\n" +
    "		stroke-width:2px;\n" +
    "	}\n" +
    "</style>\n" +
    "\n" +
    "<div class='ac-title' style='font-weight: bold;font-size: 1.2em;'>{{acConfig.title}}</div>\n" +
    "<div class='ac-legend' style='float:left; max-width:25%;' ng-show='{{acConfig.legend.display}}'>\n" +
    "	<table style='list-style:none;margin:0px;padding:0px;'>\n" +
    "	<tr ng-repeat=\"l in legends\">\n" +
    "		<td><div ng-attr-style='background:{{l.color}}; height:15px;width:15px;'></div></td>\n" +
    "		<td style=' display: inline-block;' ng-bind='l.title'></td>\n" +
    "	</tr>\n" +
    "	</table>\n" +
    "</div>\n" +
    "<div class='ac-chart' style='float:left; width:75%;'>\n" +
    "</div>");
}]);

angular.module("right", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("right",
    "<style>\n" +
    "	.axis path,\n" +
    "	.axis line {\n" +
    "	  fill: none;\n" +
    "	  stroke: #333;\n" +
    "	}\n" +
    "	.ac-line {\n" +
    "		fill:none;\n" +
    "		stroke-width:2px;\n" +
    "	}\n" +
    "</style>\n" +
    "\n" +
    "<div class='ac-title' style='font-weight: bold;font-size: 1.2em;'>{{acConfig.title}}</div>\n" +
    "<div class='ac-chart' style='float:left;width:75%;'>\n" +
    "</div>\n" +
    "<div class='ac-legend' style='float:left; max-width:25%;' ng-show='{{acConfig.legend.display}}'>\n" +
    "	<table style='list-style:none;margin:0px;padding:0px;'>\n" +
    "	<tr ng-repeat=\"l in legends | limitTo:yMaxData\">\n" +
    "		<td><div ng-attr-style='background:{{l.color}}; height:15px;width:15px;'></div></td>\n" +
    "		<td style=' display: inline-block;' ng-bind='l.title'></td>\n" +
    "	</tr>\n" +
    "	</table>\n" +
    "</div>");
}]);
